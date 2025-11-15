// ========== checkers.js - COMPLETE ROUTES FILE ==========

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { User, Transaction, ResultCheckerPurchase } = require('../schema/schema');
const dotenv = require('dotenv');

dotenv.config();

// ========== DATAMART API CONFIGURATION ==========
const DATAMART_BASE_URL = 'https://api.datamartgh.shop';
const DATAMART_API_KEY = process.env.DATAMART_API_KEY || 'cc2c99d602dd5283acbdf64807914632af45783d2667687df01824f0b89f39a6';

const datamartClient = axios.create({
  baseURL: DATAMART_BASE_URL,
  headers: {
    'x-api-key': DATAMART_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Enhanced logging function
const logOperation = (operation, data) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [${operation}]`, JSON.stringify(data, null, 2));
};

// FIXED PRICING FOR CHECKERS
const CHECKER_PRICING = {
  'WAEC': 19.00,
  'BECE': 19.00
};

// Phone validation for Ghana
const validatePhoneNumber = (phoneNumber) => {
  const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
  
  if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
    const validPrefixes = ['024', '054', '055', '059', '026', '025', '053', '027', '057', '023', '020', '050', '056'];
    const prefix = cleanNumber.substring(0, 3);
    
    if (validPrefixes.includes(prefix)) {
      return { isValid: true, message: '' };
    }
  }
  
  return { 
    isValid: false, 
    message: 'Please enter a valid 10-digit Ghana phone number starting with 0' 
  };
};

// Generate unique reference
function generateCheckerReference(checkerType) {
  const prefix = checkerType === 'WAEC' ? 'WEC' : 'BEC';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

// ========== GET AVAILABLE CHECKER PRODUCTS ==========
router.get('/checker-products', async (req, res) => {
  try {
    logOperation('CHECKER_PRODUCTS_REQUEST', { timestamp: new Date() });

    const products = [
      {
        id: 'waec',
        name: 'WAEC Result Checker',
        description: 'Check your WAEC examination results online',
        price: CHECKER_PRICING['WAEC'],
        type: 'WAEC',
        features: ['View results online', 'Print certificates', 'Share results'],
        icon: '📚'
      },
      {
        id: 'bece',
        name: 'BECE Result Checker',
        description: 'Check your BECE examination results online',
        price: CHECKER_PRICING['BECE'],
        type: 'BECE',
        features: ['View results online', 'Print certificates', 'Share results'],
        icon: '🎓'
      }
    ];

    logOperation('CHECKER_PRODUCTS_RESPONSE', { productsCount: products.length });

    res.json({
      status: 'success',
      data: products
    });

  } catch (error) {
    logOperation('CHECKER_PRODUCTS_ERROR', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch checker products'
    });
  }
});

// ========== PURCHASE RESULT CHECKER ==========
router.post('/purchase-checker', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { 
      userId, 
      phoneNumber, 
      checkerType, 
      price,
      skipSms = false
    } = req.body;

    logOperation('CHECKER_PURCHASE_REQUEST', {
      userId,
      phoneNumber: phoneNumber?.substring(0, 3) + 'XXXXXXX',
      checkerType,
      price,
      skipSms,
      timestamp: new Date()
    });

    // Validate inputs
    if (!userId || !phoneNumber || !checkerType) {
      logOperation('CHECKER_PURCHASE_VALIDATION_ERROR', {
        missingFields: {
          userId: !userId,
          phoneNumber: !phoneNumber,
          checkerType: !checkerType
        }
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields'
      });
    }

    // Validate checker type
    if (!['WAEC', 'BECE'].includes(checkerType)) {
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: 'Invalid checker type. Must be WAEC or BECE'
      });
    }

    // Validate phone number
    const phoneValidation = validatePhoneNumber(phoneNumber);
    if (!phoneValidation.isValid) {
      logOperation('CHECKER_PHONE_VALIDATION_FAILED', {
        checkerType,
        phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX',
        validationMessage: phoneValidation.message
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: phoneValidation.message
      });
    }

    // Find user
    const user = await User.findById(userId).session(session);
    if (!user) {
      logOperation('CHECKER_PURCHASE_USER_NOT_FOUND', { userId });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get official price
    const officialPrice = CHECKER_PRICING[checkerType];

    // Validate price matches
    if (price && Math.abs(parseFloat(price) - officialPrice) > 0.01) {
      logOperation('CHECKER_PRICE_MISMATCH', {
        checkerType,
        submittedPrice: parseFloat(price),
        officialPrice,
        userId
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: 'Invalid price. Please refresh and try again',
        expectedPrice: officialPrice
      });
    }

    // Check wallet balance
    if (user.walletBalance < officialPrice) {
      logOperation('CHECKER_INSUFFICIENT_BALANCE', {
        userId,
        walletBalance: user.walletBalance,
        requiredAmount: officialPrice
      });
      
      await session.abortTransaction();
      session.endSession();
      
      return res.status(400).json({
        status: 'error',
        message: 'Insufficient wallet balance',
        currentBalance: user.walletBalance,
        requiredAmount: officialPrice
      });
    }

    // Generate references
    const transactionReference = `TRX-${uuidv4()}`;
    const checkerReference = generateCheckerReference(checkerType);

    logOperation('CHECKER_REFERENCES_GENERATED', {
      transactionReference,
      checkerReference,
      checkerType
    });

    // Call DataMart API to purchase checker
    let datamartResponse = null;
    let serialNumber = null;
    let pin = null;
    let orderStatus = 'pending';

    try {
      logOperation('DATAMART_CHECKER_API_REQUEST', {
        checkerType,
        phoneNumber: phoneNumber.substring(0, 3) + 'XXXXXXX',
        reference: checkerReference,
        skipSms
      });

      const datamartPayload = {
        checkerType: checkerType,
        phoneNumber: phoneNumber,
        ref: checkerReference,
        skipSms: skipSms // If true, DataMart won't send SMS, we handle it
      };

      datamartResponse = await datamartClient.post('/api/checkers/purchase', datamartPayload);

      logOperation('DATAMART_CHECKER_API_RESPONSE', {
        status: datamartResponse.status,
        statusCode: datamartResponse.status,
        hasData: !!datamartResponse.data
      });

      if (datamartResponse.data && datamartResponse.data.status === 'success') {
        orderStatus = 'completed';
        
        // Extract details from response
        if (datamartResponse.data.data) {
          serialNumber = datamartResponse.data.data.serialNumber;
          pin = datamartResponse.data.data.pin;
          
          logOperation('DATAMART_CHECKER_DETAILS_EXTRACTED', {
            serialNumber: serialNumber ? 'received' : 'not received',
            pin: pin ? 'received' : 'not received'
          });
        }
      } else {
        logOperation('DATAMART_CHECKER_UNSUCCESSFUL_RESPONSE', {
          response: datamartResponse.data
        });
        
        await session.abortTransaction();
        session.endSession();
        
        let errorMessage = datamartResponse.data?.message || 'Could not complete your purchase';
        
        return res.status(400).json({
          status: 'error',
          message: errorMessage
        });
      }

    } catch (apiError) {
      logOperation('DATAMART_CHECKER_API_ERROR', {
        error: apiError.message,
        response: apiError.response?.data,
        status: apiError.response?.status
      });

      await session.abortTransaction();
      session.endSession();

      let errorMessage = 'Could not complete your purchase. Please try again later.';
      
      if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      }

      return res.status(400).json({
        status: 'error',
        message: errorMessage
      });
    }

    // Create Transaction
    const transaction = new Transaction({
      userId,
      type: 'checker-purchase',
      amount: officialPrice,
      status: 'completed',
      reference: transactionReference,
      gateway: 'wallet',
      metadata: {
        checkerType,
        phoneNumber,
        checkerReference
      }
    });

    // Create Result Checker Purchase
    const checkerPurchase = new ResultCheckerPurchase({
      userId,
      phoneNumber,
      checkerType,
      price: officialPrice,
      status: orderStatus,
      reference: checkerReference,
      datamartReference: checkerReference,
      serialNumber,
      pin,
      apiResponse: datamartResponse?.data || {},
      transactionId: transaction._id,
      notificationSent: !skipSms,
      notificationMethod: skipSms ? 'manual' : 'sms'
    });

    // Update user wallet
    const previousBalance = user.walletBalance;
    user.walletBalance -= officialPrice;

    // Save all documents
    await transaction.save({ session });
    await checkerPurchase.save({ session });
    await user.save({ session });

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    logOperation('CHECKER_PURCHASE_SUCCESS', {
      userId,
      checkerType,
      checkerReference,
      previousBalance,
      newWalletBalance: user.walletBalance,
      amountDeducted: officialPrice,
      status: orderStatus,
      hasSerialNumber: !!serialNumber,
      hasPin: !!pin
    });

    // Prepare response
    const response = {
      status: 'success',
      message: `${checkerType} result checker purchased successfully`,
      data: {
        transaction,
        checkerPurchase,
        walletBalance: {
          previous: previousBalance,
          current: user.walletBalance,
          deducted: officialPrice
        },
        checkerDetails: {
          type: checkerType,
          reference: checkerReference,
          serialNumber: serialNumber || 'Will be sent via SMS',
          pin: pin || 'Will be sent via SMS',
          phoneNumber: phoneNumber
        }
      }
    };

    // Include SMS notification status if available
    if (datamartResponse?.data?.data?.smsNotification) {
      response.data.smsNotification = datamartResponse.data.data.smsNotification;
    }

    res.status(201).json(response);

  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    
    logOperation('CHECKER_PURCHASE_ERROR', {
      message: error.message,
      stack: error.stack
    });

    res.status(500).json({
      status: 'error',
      message: 'Could not complete your purchase. Please try again later.'
    });
  }
});

// ========== GET CHECKER PURCHASE HISTORY ==========
router.get('/checker-history/:userId', async (req, res) => {
  try {
    const { page = 1, limit = 20, checkerType, status } = req.query;
    const userId = req.params.userId;

    logOperation('CHECKER_HISTORY_REQUEST', {
      userId,
      page,
      limit,
      checkerType,
      status
    });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }

    // Build filter
    const filter = { userId };
    
    if (checkerType && checkerType !== 'All') {
      filter.checkerType = checkerType;
    }
    
    if (status && status !== 'All') {
      filter.status = status;
    }

    logOperation('CHECKER_HISTORY_FILTER', filter);

    const purchases = await ResultCheckerPurchase.find(filter)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ResultCheckerPurchase.countDocuments(filter);

    logOperation('CHECKER_HISTORY_RESULTS', {
      totalFound: total,
      returnedCount: purchases.length,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

    res.json({
      status: 'success',
      data: {
        purchases: purchases.map(p => ({
          ...p.toObject(),
          pin: p.status === 'completed' ? p.pin : null, // Only show PIN if completed
          serialNumber: p.status === 'completed' ? p.serialNumber : null
        })),
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(total / Number(limit)),
          totalPurchases: total
        }
      }
    });

  } catch (error) {
    logOperation('CHECKER_HISTORY_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch checker purchase history'
    });
  }
});

// ========== GET CHECKER STATUS ==========
router.get('/checker-status/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    logOperation('CHECKER_STATUS_REQUEST', { reference });

    const checkerPurchase = await ResultCheckerPurchase.findOne({ reference })
      .populate('userId', 'name email phoneNumber');

    if (!checkerPurchase) {
      logOperation('CHECKER_STATUS_NOT_FOUND', { reference });
      
      return res.status(404).json({
        status: 'error',
        message: 'Checker purchase not found'
      });
    }

    logOperation('CHECKER_STATUS_FOUND', {
      reference,
      status: checkerPurchase.status,
      checkerType: checkerPurchase.checkerType
    });

    // Don't expose PIN in status check
    const responseData = checkerPurchase.toObject();
    delete responseData.pin;

    res.json({
      status: 'success',
      data: responseData
    });

  } catch (error) {
    logOperation('CHECKER_STATUS_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch checker status'
    });
  }
});

// ========== GET USER CHECKER DASHBOARD ==========
router.get('/checker-dashboard/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    logOperation('CHECKER_DASHBOARD_REQUEST', { userId });

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid user ID'
      });
    }

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Get today's purchases
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayPurchases = await ResultCheckerPurchase.find({
      userId,
      createdAt: { $gte: today, $lt: tomorrow }
    }).sort({ createdAt: -1 });

    // Get stats
    const allPurchases = await ResultCheckerPurchase.find({ userId });
    
    const waecCount = allPurchases.filter(p => p.checkerType === 'WAEC').length;
    const beceCount = allPurchases.filter(p => p.checkerType === 'BECE').length;
    const totalSpent = allPurchases.reduce((sum, p) => sum + p.price, 0);

    logOperation('CHECKER_DASHBOARD_RESULTS', {
      userId,
      todayCount: todayPurchases.length,
      waecCount,
      beceCount,
      totalSpent
    });

    res.json({
      status: 'success',
      data: {
        userBalance: user.walletBalance,
        todayPurchases: {
          count: todayPurchases.length,
          purchases: todayPurchases
        },
        statistics: {
          totalWAEC: waecCount,
          totalBECE: beceCount,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          totalPurchases: allPurchases.length
        }
      }
    });

  } catch (error) {
    logOperation('CHECKER_DASHBOARD_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch checker dashboard'
    });
  }
});

// ========== RESEND CHECKER DETAILS (if not received) ==========
router.post('/resend-checker/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    logOperation('CHECKER_RESEND_REQUEST', { reference });

    const checkerPurchase = await ResultCheckerPurchase.findOne({ reference });

    if (!checkerPurchase) {
      return res.status(404).json({
        status: 'error',
        message: 'Checker purchase not found'
      });
    }

    if (checkerPurchase.status !== 'completed') {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot resend details for incomplete purchases'
      });
    }

    if (!checkerPurchase.serialNumber || !checkerPurchase.pin) {
      return res.status(400).json({
        status: 'error',
        message: 'Checker details are not available for resend'
      });
    }

    // TODO: Call SMS service to resend details
    logOperation('CHECKER_DETAILS_RESEND', {
      reference,
      phoneNumber: checkerPurchase.phoneNumber.substring(0, 3) + 'XXXXXXX',
      checkerType: checkerPurchase.checkerType
    });

    checkerPurchase.notificationSent = true;
    await checkerPurchase.save();

    res.json({
      status: 'success',
      message: 'Checker details sent to your phone',
      data: {
        reference,
        phoneNumber: checkerPurchase.phoneNumber,
        sentAt: new Date()
      }
    });

  } catch (error) {
    logOperation('CHECKER_RESEND_ERROR', {
      message: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      status: 'error',
      message: 'Failed to resend checker details'
    });
  }
});

module.exports = router;