const express = require('express');
const router = express.Router();
const { Transaction, User, TransactionAudit } = require('../schema/schema');
const axios = require('axios');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Paystack configuration
const PAYSTACK_SECRET_KEY = 'sk_live_56a5fa6fc178c1cbbbed6d650682eb89c9b5cf4f'; 
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// ========== VALIDATION UTILITIES ==========
function validateAmountCalculation(depositAmount, totalWithFee) {
  const deposit = parseFloat(depositAmount);
  const total = parseFloat(totalWithFee);
  
  if (isNaN(deposit) || isNaN(total)) {
    return { valid: false, error: 'Invalid amount format' };
  }
  
  // Amount must be within acceptable range
  if (deposit < 10 || deposit > 100000) {
    return { valid: false, error: 'Amount must be between GHS 10 and GHS 100,000' };
  }
  
  // Calculate expected total with 3% fee
  const expectedTotal = deposit * 1.03;
  const tolerance = 0.01; // 1 pesewa tolerance
  const difference = Math.abs(total - expectedTotal);
  
  if (difference > tolerance) {
    return { 
      valid: false, 
      error: `Amount mismatch detected. Expected GHS ${expectedTotal.toFixed(2)}, got GHS ${total.toFixed(2)}`,
      deposited: deposit,
      expected: expectedTotal,
      provided: total,
      fraud: true
    };
  }
  
  return { valid: true, depositAmount: deposit, totalAmount: total };
}

function validatePaystackAmount(paystackAmount, expectedAmount) {
  // Paystack amounts are in pesewas (1 GHS = 100 pesewas)
  const paystackGHS = paystackAmount / 100;
  const expectedGHS = expectedAmount / 100;
  
  const difference = Math.abs(paystackGHS - expectedGHS);
  const tolerance = 0.01; // 1 pesewa tolerance
  
  if (difference > tolerance) {
    return {
      valid: false,
      error: `Paystack amount mismatch. Expected ${expectedGHS.toFixed(2)} GHS (${expectedAmount} pesewas), but charged ${paystackGHS.toFixed(2)} GHS (${paystackAmount} pesewas)`,
      fraud: true
    };
  }
  
  return { valid: true };
}

// ========== FRAUD DETECTION ==========
async function flagFraudActivity(userId, amount, paystackAmount) {
  const flags = [];
  const metadata = {};
  
  // Check recent deposit frequency
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentDeposits = await Transaction.countDocuments({
    userId,
    type: 'deposit',
    status: 'completed',
    createdAt: { $gte: oneHourAgo }
  });
  
  if (recentDeposits >= 3) {
    flags.push('Multiple deposits within 1 hour');
    metadata.recentDeposits = recentDeposits;
  }
  
  // Check for unusually large amounts
  if (amount > 10000) {
    flags.push('Large amount deposit');
    metadata.largeAmount = true;
  }
  
  // Check account age vs deposit size
  const user = await User.findById(userId);
  if (user) {
    const accountAge = Date.now() - new Date(user.createdAt).getTime();
    const daysOld = accountAge / (1000 * 60 * 60 * 24);
    
    if (daysOld < 1 && amount > 500) {
      flags.push('New account making large deposit');
      metadata.accountAge = daysOld;
    }
    
    if (daysOld < 0.007) { // 10 minutes
      flags.push('Deposit within 10 minutes of signup');
      metadata.accountAge = daysOld;
    }
  }
  
  // Check for amount manipulation attempts (detected before this point, but log it)
  if (paystackAmount && parseFloat(paystackAmount) < amount * 100) {
    flags.push('FRAUD ALERT: Amount manipulation attempt detected');
    metadata.fraud = true;
    metadata.attemptedAmount = amount;
    metadata.chargedAmount = paystackAmount / 100;
  }
  
  return { flags, metadata };
}

// ========== PROCESS SUCCESSFUL PAYMENT (WITH VERIFICATION) ==========
async function processSuccessfulPayment(reference, paystackData = null) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find and lock transaction
    const transaction = await Transaction.findOneAndUpdate(
      { 
        reference, 
        status: 'pending',
        processing: { $ne: true }
      },
      { 
        $set: { 
          processing: true,
          metadata: {
            verifiedAt: new Date()
          }
        } 
      },
      { new: true, session }
    );

    if (!transaction) {
      await session.abortTransaction();
      session.endSession();
      return { 
        success: false, 
        message: 'Transaction not found or already processed',
        code: 'ALREADY_PROCESSED'
      };
    }

    // ========== CRITICAL: VERIFY PAYSTACK AMOUNT ==========
    if (paystackData && paystackData.amount) {
      const expectedPaystackAmount = Math.round(transaction.amount * 1.03 * 100);
      const paystackValidation = validatePaystackAmount(paystackData.amount, expectedPaystackAmount);
      
      if (!paystackValidation.valid) {
        // REJECT - amount mismatch
        await Transaction.findByIdAndUpdate(
          transaction._id,
          { 
            status: 'failed',
            processing: false,
            'metadata.fraudFlags': ['AMOUNT_MISMATCH_WITH_PAYSTACK'],
            'metadata.paystackAmount': paystackData.amount,
            'metadata.expectedAmount': expectedPaystackAmount,
            'metadata.error': paystackValidation.error
          },
          { session }
        );
        
        await session.commitTransaction();
        session.endSession();
        
        console.error(`❌ FRAUD PREVENTED: ${reference} - ${paystackValidation.error}`);
        
        // Log to audit (without session)
        try {
          const auditEntry = new TransactionAudit({
            userId: transaction.userId,
            transactionType: 'deposit',
            amount: transaction.amount,
            status: 'failed',
            paymentMethod: 'paystack',
            paystackReference: reference,
            description: `FRAUD: Paystack amount mismatch - ${paystackValidation.error}`,
            initiatedBy: 'system'
          });
          await auditEntry.save();
        } catch (e) {
          console.error('Failed to log fraud to audit:', e);
        }
        
        return { 
          success: false, 
          message: 'Payment verification failed. Transaction blocked.',
          code: 'PAYMENT_VERIFICATION_FAILED'
        };
      }
    }

    // Get user
    const user = await User.findById(transaction.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return { success: false, message: 'User not found' };
    }

    // Run fraud detection
    const { flags, metadata } = await flagFraudActivity(
      transaction.userId, 
      transaction.amount, 
      paystackData?.amount
    );

    // Update transaction
    transaction.status = 'completed';
    transaction.processing = false;
    
    if (flags.length > 0) {
      transaction.metadata.fraudFlags = flags;
      transaction.metadata.fraudMetadata = metadata;
      console.warn(`⚠️ FRAUD ALERT: ${transaction.userId} - ${flags.join(', ')}`);
    }
    
    await transaction.save({ session });

    // Credit user
    const balanceBefore = user.walletBalance;
    user.walletBalance += transaction.amount;
    await user.save({ session });

    // Update or create audit entry
    const auditUpdate = await TransactionAudit.findOneAndUpdate(
      { paystackReference: reference },
      {
        $set: {
          status: 'completed',
          balanceAfter: user.walletBalance,
          balanceBefore: balanceBefore,
          paystackAmount: paystackData?.amount || null,
          description: `Deposit completed: GHS ${transaction.amount} credited. Paystack charged: ${(paystackData?.amount / 100).toFixed(2)} GHS`,
          updatedAt: new Date(),
          fraudFlags: flags.length > 0 ? flags : undefined
        }
      },
      { new: true, session }
    );

    if (!auditUpdate) {
      const newAudit = new TransactionAudit({
        userId: transaction.userId,
        transactionType: 'deposit',
        amount: transaction.amount,
        balanceBefore: balanceBefore,
        balanceAfter: user.walletBalance,
        paymentMethod: 'paystack',
        paystackReference: reference,
        paystackAmount: paystackData?.amount || null,
        status: 'completed',
        description: `Deposit completed: GHS ${transaction.amount} credited`,
        initiatedBy: 'user',
        fraudFlags: flags.length > 0 ? flags : undefined
      });
      await newAudit.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    console.log(`✅ DEPOSIT SECURED: ${reference}, Amount GHS ${transaction.amount}, Paystack charged ${(paystackData?.amount / 100).toFixed(2)} GHS`);
    
    return { 
      success: true, 
      message: 'Deposit successful',
      amount: transaction.amount,
      newBalance: user.walletBalance,
      fraudFlags: flags
    };

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('❌ Payment processing error:', error);
    throw error;
  }
}

// ========== INITIATE DEPOSIT (VALIDATED) ==========
router.post('/deposit', async (req, res) => {
  try {
    const { userId, amount, totalAmountWithFee, email } = req.body;

    // Validate inputs exist
    if (!userId || !amount || !totalAmountWithFee) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: userId, amount, totalAmountWithFee',
        code: 'INVALID_INPUT'
      });
    }

    // ========== CRITICAL: VALIDATE AMOUNT CALCULATION ==========
    const amountValidation = validateAmountCalculation(amount, totalAmountWithFee);
    if (!amountValidation.valid) {
      console.warn(`❌ REJECTED: Amount validation failed - ${amountValidation.error}`);
      
      // Log fraud attempt
      if (amountValidation.fraud) {
        console.error(`🚨 FRAUD ATTEMPT: amount=${amountValidation.deposited}, totalAmountWithFee=${amountValidation.provided}`);
      }
      
      return res.status(400).json({ 
        success: false,
        error: amountValidation.error,
        code: 'INVALID_AMOUNT_CALCULATION'
      });
    }

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    // Check account status
    if (user.isDisabled) {
      return res.status(403).json({
        success: false,
        error: 'Account is disabled',
        message: 'Your account has been disabled. Deposits are not allowed.',
        disableReason: user.disableReason || 'No reason provided'
      });
    }

    // Generate reference
    const reference = `DEP-${crypto.randomBytes(10).toString('hex')}-${Date.now()}`;

    // Create transaction
    const transaction = new Transaction({
      userId,
      type: 'deposit',
      amount: amountValidation.depositAmount,
      status: 'pending',
      reference,
      gateway: 'paystack',
      metadata: {
        depositAmount: amountValidation.depositAmount,
        totalWithFee: amountValidation.totalAmount,
        expectedPaystackAmount: Math.round(amountValidation.totalAmount * 100),
        feePercentage: 3
      }
    });

    await transaction.save();

    // Create audit entry
    const auditEntry = new TransactionAudit({
      userId,
      transactionType: 'deposit',
      amount: amountValidation.depositAmount,
      balanceBefore: user.walletBalance,
      balanceAfter: user.walletBalance,
      paymentMethod: 'paystack',
      paystackReference: reference,
      status: 'pending',
      description: `Deposit initiated: GHS ${amountValidation.depositAmount}`,
      initiatedBy: 'user'
    });

    await auditEntry.save();

    // Initialize Paystack
    const paystackAmount = Math.round(amountValidation.totalAmount * 100);
    
    const paystackResponse = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email: email || user.email,
        amount: paystackAmount,
        currency: 'GHS',
        reference,
        callback_url: `https://www.dataspot.store/payment/callback?reference=${reference}`,
        metadata: {
          depositAmount: amountValidation.depositAmount,
          totalWithFee: amountValidation.totalAmount,
          userId
        }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return res.json({
      success: true,
      message: 'Deposit initiated',
      paystackUrl: paystackResponse.data.data.authorization_url,
      reference,
      amount: amountValidation.depositAmount,
      total: amountValidation.totalAmount
    });

  } catch (error) {
    console.error('❌ Deposit Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

// ========== PAYSTACK WEBHOOK (VALIDATES AMOUNT) ==========
router.post('/paystack/webhook', async (req, res) => {
  try {
    console.log('📩 Webhook received:', {
      event: req.body.event,
      reference: req.body.data?.reference,
      amount: req.body.data?.amount
    });

    const secret = PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Verify signature
    if (hash !== req.headers['x-paystack-signature']) {
      console.error('❌ Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = req.body;

    // Handle successful charge
    if (event.event === 'charge.success') {
      const { reference, amount } = event.data;
      console.log(`✅ Paystack charge.success: ${reference}, amount: ${amount}`);

      // Pass Paystack data including amount for validation
      const result = await processSuccessfulPayment(reference, event.data);
      
      if (result.success) {
        return res.json({ 
          message: result.message,
          amount: result.amount,
          newBalance: result.newBalance,
          fraudFlags: result.fraudFlags
        });
      } else {
        return res.status(400).json({
          message: result.message,
          code: result.code
        });
      }
    } else {
      console.log(`ℹ️ Event: ${event.event}`);
      return res.json({ message: 'Event received' });
    }

  } catch (error) {
    console.error('❌ Webhook Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ========== VERIFY PAYMENT ==========
router.get('/verify-payment', async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ success: false, error: 'Reference is required' });
    }

    const transaction = await Transaction.findOne({ reference });

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }

    if (transaction.status === 'completed') {
      return res.json({
        success: true,
        message: 'Payment verified and completed',
        data: {
          reference,
          amount: transaction.amount,
          status: transaction.status
        }
      });
    }

    if (transaction.status === 'pending') {
      try {
        const paystackResponse = await axios.get(
          `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const { data } = paystackResponse.data;

        if (data.status === 'success') {
          // Pass Paystack data for amount verification
          const result = await processSuccessfulPayment(reference, data);
          
          if (result.success) {
            return res.json({
              success: true,
              message: 'Payment verified and credited',
              data: {
                reference,
                amount: transaction.amount,
                newBalance: result.newBalance,
                status: 'completed'
              }
            });
          } else {
            return res.json({
              success: false,
              message: result.message,
              code: result.code,
              data: { reference, amount: transaction.amount, status: transaction.status }
            });
          }
        } else {
          return res.json({
            success: false,
            message: 'Payment not yet verified',
            data: {
              reference,
              amount: transaction.amount,
              paystackStatus: data.status
            }
          });
        }
      } catch (error) {
        console.error('❌ Paystack verification error:', error);
        return res.status(500).json({ success: false, error: 'Failed to verify with Paystack' });
      }
    }

    return res.json({
      success: false,
      message: `Transaction status: ${transaction.status}`,
      data: { reference, amount: transaction.amount, status: transaction.status }
    });

  } catch (error) {
    console.error('❌ Verification Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ========== GET USER TRANSACTIONS ==========
router.get('/user-transactions/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'User ID is required' });
    }
    
    const filter = { userId, type: 'deposit' };
    if (status) filter.status = status;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const totalCount = await Transaction.countDocuments(filter);
    
    return res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          total: totalCount,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Get Transactions Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ========== VERIFY PENDING TRANSACTION ==========
router.post('/verify-pending-transaction/:transactionId', async (req, res) => {
  try {
    const { transactionId } = req.params;
    const transaction = await Transaction.findById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    
    if (transaction.status !== 'pending') {
      return res.json({
        success: false,
        message: `Transaction is already ${transaction.status}`,
        data: {
          transactionId,
          reference: transaction.reference,
          amount: transaction.amount,
          status: transaction.status
        }
      });
    }
    
    try {
      const paystackResponse = await axios.get(
        `${PAYSTACK_BASE_URL}/transaction/verify/${transaction.reference}`,
        {
          headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const { data } = paystackResponse.data;
      
      if (data.status === 'success') {
        const result = await processSuccessfulPayment(transaction.reference, data);
        
        if (result.success) {
          return res.json({
            success: true,
            message: 'Verified and credited successfully',
            data: {
              transactionId,
              reference: transaction.reference,
              amount: transaction.amount,
              newBalance: result.newBalance,
              status: 'completed'
            }
          });
        } else {
          return res.json({
            success: false,
            message: result.message,
            code: result.code,
            data: {
              transactionId,
              reference: transaction.reference,
              amount: transaction.amount,
              status: transaction.status
            }
          });
        }
      } else if (data.status === 'failed') {
        transaction.status = 'failed';
        await transaction.save();
        
        return res.json({
          success: false,
          message: 'Payment failed on Paystack',
          data: {
            transactionId,
            reference: transaction.reference,
            amount: transaction.amount,
            status: 'failed'
          }
        });
      } else {
        return res.json({
          success: false,
          message: `Payment status: ${data.status}`,
          data: {
            transactionId,
            reference: transaction.reference,
            amount: transaction.amount,
            status: transaction.status
          }
        });
      }
    } catch (error) {
      console.error('❌ Paystack verification error:', error);
      return res.status(500).json({ success: false, error: 'Failed to verify with Paystack' });
    }
    
  } catch (error) {
    console.error('❌ Verify Pending Transaction Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;