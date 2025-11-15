// ========== UPDATED SCHEMA.JS - ADD TO YOUR EXISTING FILE ==========

const mongoose = require("mongoose");

// Device Block Schema
const BlockedDeviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  reason: { type: String },
  blockedAt: { type: Date, default: Date.now },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata" }
});

// Friend Registration Schema
const RegisteredFriendSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata" },
  name: { type: String },
  email: { type: String },
  phoneNumber: { type: String },
  registeredAt: { type: Date, default: Date.now }
});

// Result Checker Purchase Schema (NEW)
const ResultCheckerPurchaseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usercheapdata", 
    required: true 
  },
  phoneNumber: { 
    type: String, 
    required: true 
  },
  checkerType: { 
    type: String, 
    enum: ["WAEC", "BECE"], 
    required: true 
  },
  serialNumber: { 
    type: String, 
    sparse: true
  },
  pin: { 
    type: String, 
    sparse: true
  },
  price: { 
    type: Number, 
    default: 19.00,
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "completed", "failed", "refunded"], 
    default: "pending" 
  },
  reference: { 
    type: String, 
    unique: true,
    required: true 
  },
  datamartReference: { 
    type: String, 
    sparse: true
  },
  datamartPurchaseId: { 
    type: String, 
    sparse: true
  },
  apiResponse: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  transactionId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Transactioncheapdata" 
  },
  notificationSent: { 
    type: Boolean, 
    default: false 
  },
  notificationMethod: { 
    type: String, 
    enum: ["sms", "system", "manual"],
    default: "sms" 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

ResultCheckerPurchaseSchema.index({ userId: 1 });
ResultCheckerPurchaseSchema.index({ reference: 1 });
ResultCheckerPurchaseSchema.index({ datamartReference: 1 });
ResultCheckerPurchaseSchema.index({ status: 1 });
ResultCheckerPurchaseSchema.index({ createdAt: -1 });

// User Schema with blocked devices, registered friends and admin approval
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  role: { type: String, enum: ["buyer", "seller", "reporter", "admin", "Dealer"], default: "buyer" },
  walletBalance: { type: Number, default: 0 },
  referralCode: { type: String, unique: true },
  referredBy: { type: String, default: null },
  
  registeredByUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata" },
  registeredFriends: [RegisteredFriendSchema],
  
  createdAt: { type: Date, default: Date.now },
  
  resetPasswordOTP: { type: String, select: false },
  resetPasswordOTPExpiry: { type: Date, select: false },
  lastPasswordReset: { type: Date },
  
  isDisabled: { type: Boolean, default: false },
  disableReason: { type: String },
  disabledAt: { type: Date },
  
  blockedDevices: [BlockedDeviceSchema],
  lastLogin: {
    deviceId: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date }
  },
  
  approvalStatus: { 
    type: String, 
    enum: ["pending", "approved", "rejected"], 
    default: "pending" 
  },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usercheapdata" 
  },
  approvedAt: { 
    type: Date 
  },
  rejectionReason: { 
    type: String 
  }
});

UserSchema.index({ approvalStatus: 1 });

const DataPurchaseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata", required: true }, 
  phoneNumber: { type: String, required: true }, 
  network: { type: String, enum: ["YELLO", "TELECEL", "AT_PREMIUM","airteltigo","at"], required: true },
  capacity: { type: Number, required: true }, 
  gateway: { type: String, required: true }, 
  method: { type: String, enum: ["web", "api"], required: true }, 
  price: { type: Number, required: true }, 
  geonetReference: { type: String, required: true }, 
  status: { type: String, enum: ["pending", "completed", "failed","processing","refunded","refund","delivered","on","waiting","accepted"], default: "pending" }, 
  processing: { type: Boolean, default: false },
  adminNotes: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata" },
  updatedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usercheapdata',
    required: true
  },
  type: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'refund','purchase','admin-deduction', 'checker-purchase'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled','purchase','accepted'],
    default: 'pending'
  },
  reference: {
    type: String,
    required: true,
    unique: true
  },
  gateway: {
    type: String,
    enum: ['paystack', 'manual', 'system','wallet','admin-deposit','admin-deduction'],
    default: 'paystack'
  },
  processing: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const TransactionAuditSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usercheapdata',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['deposit', 'withdrawal', 'transfer', 'refund', 'purchase', 'admin-deduction', 'checker-purchase'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  balanceBefore: {
    type: Number,
    default: 0
  },
  balanceAfter: {
    type: Number,
    default: 0
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'manual', 'system', 'wallet', 'admin-deposit', 'admin-deduction'],
    default: 'system'
  },
  paystackReference: {
    type: String,
    sparse: true
  },
  paystackAmount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  description: {
    type: String
  },
  initiatedBy: {
    type: String,
    enum: ['user', 'system', 'admin'],
    default: 'system'
  },
  fraudFlags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

TransactionAuditSchema.index({ userId: 1 });
TransactionAuditSchema.index({ paystackReference: 1 });
TransactionAuditSchema.index({ createdAt: -1 });
TransactionAuditSchema.index({ status: 1 });

const ReferralBonusSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata", required: true }, 
  referredUserId: { type: mongoose.Schema.Types.ObjectId, ref: "Usercheapdata", required: true }, 
  amount: { type: Number, required: true }, 
  status: { type: String, enum: ["pending", "credited"], default: "pending" },
  registrationType: { type: String, enum: ["referral", "friend-registration"], default: "referral" },
  createdAt: { type: Date, default: Date.now }
});

const DataInventorySchema = new mongoose.Schema({
  network: { type: String, enum: ["YELLO", "TELECEL", "AT_PREMIUM", "airteltigo", "at","waiting"], required: true },
  inStock: { type: Boolean, default: true },
  skipGeonettech: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

const Schema = mongoose.Schema;

const apiKeySchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'Usercheapdata',
        required: true
    },
    key: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUsed: {
        type: Date,
        default: null
    },
    expiresAt: {
        type: Date,
        default: null
    }
});

apiKeySchema.index({ key: 1 });
apiKeySchema.index({ userId: 1 });

const OrderReportSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Usercheapdata", 
    required: true 
  },
  purchaseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "DataPurchase", 
    required: true 
  },
  reason: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["pending", "investigating", "resolved", "rejected"], 
    default: "pending" 
  },
  adminNotes: { 
    type: String 
  },
  resolution: { 
    type: String, 
    enum: ["refund", "resend", "other", null], 
    default: null 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

OrderReportSchema.index({ userId: 1 });
OrderReportSchema.index({ purchaseId: 1 }); 
OrderReportSchema.index({ status: 1 });

// Export all models
const User = mongoose.model("Usercheapdata", UserSchema);
const DataPurchase = mongoose.model("DataPurchasecheapdata", DataPurchaseSchema);
const Transaction = mongoose.model("Transactioncheapdata", TransactionSchema);
const TransactionAudit = mongoose.model("TransactionAuditcheapdata", TransactionAuditSchema);
const ReferralBonus = mongoose.model("ReferralBonuscheapdata", ReferralBonusSchema);
const ApiKey = mongoose.model('ApiKeydatahusle', apiKeySchema);
const DataInventory = mongoose.model("DataInventorycheapdata", DataInventorySchema);
const OrderReport = mongoose.model("OrderReporthustle", OrderReportSchema);
const ResultCheckerPurchase = mongoose.model("ResultCheckerPurchasecheapdata", ResultCheckerPurchaseSchema);

module.exports = { 
  User, 
  DataPurchase, 
  Transaction, 
  TransactionAudit,
  ReferralBonus, 
  ApiKey, 
  DataInventory, 
  OrderReport,
  ResultCheckerPurchase
};