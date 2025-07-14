const mongoose = require('mongoose');

/**
 * Cart Schema for ShopWise AI
 * Handles shopping cart functionality with product variants and quantities
 */
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
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
      min: [1, 'Quantity must be at least 1'],
      default: 1
    },
    // Store product details at time of adding to cart
    // This prevents issues if product details change
    productSnapshot: {
      name: String,
      price: Number,
      image: String,
      sku: String
    },
    // Product variants (size, color, etc.)
    selectedVariants: [{
      name: String,
      value: String,
      price: Number
    }],
    // Individual item price (including variants)
    itemPrice: {
      type: Number,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Cart totals
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  shipping: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  // Applied discounts
  discounts: [{
    code: String,
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'shipping']
    },
    value: Number,
    description: String
  }],
  discountAmount: {
    type: Number,
    default: 0
  },
  // Cart status
  status: {
    type: String,
    enum: ['active', 'abandoned', 'converted'],
    default: 'active'
  },
  // Session tracking for guest users
  sessionId: String,
  // Cart expiry (for cleanup)
  expiresAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // 30 days
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ status: 1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Calculate cart totals
cartSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.itemPrice * item.quantity);
  }, 0);

  // Apply discounts
  this.discountAmount = this.discounts.reduce((total, discount) => {
    if (discount.type === 'percentage') {
      return total + (this.subtotal * discount.value / 100);
    } else if (discount.type === 'fixed') {
      return total + discount.value;
    }
    return total;
  }, 0);

  // Calculate tax (assuming 8.5% tax rate)
  const taxRate = 0.085;
  this.tax = Math.round((this.subtotal - this.discountAmount) * taxRate * 100) / 100;

  // Calculate shipping (free shipping over $35)
  this.shipping = (this.subtotal - this.discountAmount) >= 35 ? 0 : 5.99;

  // Apply shipping discounts
  const shippingDiscount = this.discounts.find(d => d.type === 'shipping');
  if (shippingDiscount) {
    this.shipping = Math.max(0, this.shipping - shippingDiscount.value);
  }

  // Calculate total
  this.total = Math.round((this.subtotal - this.discountAmount + this.tax + this.shipping) * 100) / 100;

  return this;
};

// Add item to cart
cartSchema.methods.addItem = function(productId, quantity, productSnapshot, selectedVariants = [], itemPrice) {
  const existingItemIndex = this.items.findIndex(item => 
    item.product.toString() === productId.toString() &&
    JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
  );

  if (existingItemIndex > -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += quantity;
  } else {
    // Add new item
    this.items.push({
      product: productId,
      quantity,
      productSnapshot,
      selectedVariants,
      itemPrice
    });
  }

  this.calculateTotals();
  return this.save();
};

// Remove item from cart
cartSchema.methods.removeItem = function(itemId) {
  this.items = this.items.filter(item => item._id.toString() !== itemId.toString());
  this.calculateTotals();
  return this.save();
};

// Update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, quantity) {
  const item = this.items.find(item => item._id.toString() === itemId.toString());
  if (item) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }
    item.quantity = quantity;
    this.calculateTotals();
    return this.save();
  }
  throw new Error('Item not found in cart');
};

// Clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.subtotal = 0;
  this.tax = 0;
  this.shipping = 0;
  this.total = 0;
  this.discounts = [];
  this.discountAmount = 0;
  return this.save();
};

// Apply discount code
cartSchema.methods.applyDiscount = function(discountCode) {
  // This would typically validate against a discounts collection
  // For now, we'll use some sample discount codes
  const sampleDiscounts = {
    'SAVE10': { type: 'percentage', value: 10, description: '10% off your order' },
    'FREESHIP': { type: 'shipping', value: 999, description: 'Free shipping' },
    'WELCOME20': { type: 'fixed', value: 20, description: '$20 off your order' }
  };

  const discount = sampleDiscounts[discountCode.toUpperCase()];
  if (!discount) {
    throw new Error('Invalid discount code');
  }

  // Check if discount already applied
  const existingDiscount = this.discounts.find(d => d.code === discountCode.toUpperCase());
  if (existingDiscount) {
    throw new Error('Discount code already applied');
  }

  this.discounts.push({
    code: discountCode.toUpperCase(),
    ...discount
  });

  this.calculateTotals();
  return this.save();
};

// Remove discount
cartSchema.methods.removeDiscount = function(discountCode) {
  this.discounts = this.discounts.filter(d => d.code !== discountCode.toUpperCase());
  this.calculateTotals();
  return this.save();
};

// Get cart item count
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Ensure virtual fields are serialized
cartSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Cart', cartSchema);
