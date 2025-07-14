const mongoose = require('mongoose');

/**
 * Order Schema for ShopWise AI
 * Handles order processing, tracking, and history
 */
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    // Store product details at time of order
    productSnapshot: {
      name: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      image: String,
      sku: String,
      brand: String
    },
    selectedVariants: [{
      name: String,
      value: String,
      price: Number
    }],
    itemPrice: {
      type: Number,
      required: true
    },
    totalPrice: {
      type: Number,
      required: true
    }
  }],
  // Order totals
  subtotal: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  shipping: {
    type: Number,
    required: true,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  // Applied discounts
  discounts: [{
    code: String,
    type: String,
    value: Number,
    description: String
  }],
  // Shipping information
  shippingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'United States'
    },
    phone: String
  },
  // Billing information
  billingAddress: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true,
      default: 'United States'
    }
  },
  // Payment information
  paymentMethod: {
    type: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay'],
      required: true
    },
    last4: String,
    brand: String,
    expiryMonth: Number,
    expiryYear: Number
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: String, // Stripe payment intent ID or similar
  // Order status and tracking
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  // Shipping tracking
  tracking: {
    carrier: String,
    trackingNumber: String,
    trackingUrl: String,
    estimatedDelivery: Date,
    actualDelivery: Date
  },
  // Reward points
  rewardPointsEarned: {
    type: Number,
    default: 0
  },
  rewardPointsUsed: {
    type: Number,
    default: 0
  },
  // Order notes
  customerNotes: String,
  adminNotes: String,
  // Dates
  orderDate: {
    type: Date,
    default: Date.now
  },
  shippedDate: Date,
  deliveredDate: Date,
  // Return/refund information
  returnRequested: {
    type: Boolean,
    default: false
  },
  returnReason: String,
  refundAmount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ user: 1, orderDate: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderDate: -1 });

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (this.isNew && !this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `SW${timestamp.slice(-8)}${random}`;
  }
  next();
});

// Update status with history
orderSchema.methods.updateStatus = function(newStatus, note = '') {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    note
  });

  // Update relevant dates
  if (newStatus === 'shipped') {
    this.shippedDate = new Date();
  } else if (newStatus === 'delivered') {
    this.deliveredDate = new Date();
  }

  return this.save();
};

// Calculate reward points earned (1 point per dollar spent)
orderSchema.methods.calculateRewardPoints = function() {
  this.rewardPointsEarned = Math.floor(this.total);
  return this.rewardPointsEarned;
};

// Check if order can be cancelled
orderSchema.methods.canBeCancelled = function() {
  return ['pending', 'confirmed'].includes(this.status);
};

// Check if order can be returned
orderSchema.methods.canBeReturned = function() {
  if (!this.deliveredDate) return false;
  
  const returnWindow = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
  const timeSinceDelivery = Date.now() - this.deliveredDate.getTime();
  
  return timeSinceDelivery <= returnWindow && this.status === 'delivered';
};

// Get order summary for emails/notifications
orderSchema.methods.getSummary = function() {
  return {
    orderNumber: this.orderNumber,
    total: this.total,
    itemCount: this.items.reduce((sum, item) => sum + item.quantity, 0),
    status: this.status,
    orderDate: this.orderDate,
    estimatedDelivery: this.tracking?.estimatedDelivery
  };
};

// Virtual for total items count
orderSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.orderDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Order', orderSchema);
