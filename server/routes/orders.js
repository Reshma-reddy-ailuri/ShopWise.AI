const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order from cart
 * @access  Private
 */
router.post('/', protect, [
  body('shippingAddress.firstName').trim().notEmpty().withMessage('First name is required'),
  body('shippingAddress.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.state').trim().notEmpty().withMessage('State is required'),
  body('shippingAddress.zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('paymentMethod.type').isIn(['credit_card', 'debit_card', 'paypal', 'apple_pay', 'google_pay']).withMessage('Valid payment method is required'),
  body('rewardPointsUsed').optional().isInt({ min: 0 }).withMessage('Reward points must be non-negative')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { shippingAddress, billingAddress, paymentMethod, customerNotes, rewardPointsUsed = 0 } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Verify stock availability for all items
    for (const item of cart.items) {
      if (!item.product.isInStock(item.quantity)) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.product.name}`
        });
      }
    }

    // Check reward points balance
    const user = await User.findById(req.user.id);
    if (rewardPointsUsed > user.rewardPoints) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient reward points'
      });
    }

    // Create order items from cart
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      productSnapshot: {
        name: item.product.name,
        price: item.product.price,
        image: item.product.images[0]?.url,
        sku: item.product.sku,
        brand: item.product.brand
      },
      selectedVariants: item.selectedVariants,
      itemPrice: item.itemPrice,
      totalPrice: item.itemPrice * item.quantity
    }));

    // Calculate totals (accounting for reward points)
    let subtotal = cart.subtotal;
    let discountAmount = cart.discountAmount + rewardPointsUsed; // $1 per reward point
    let tax = Math.round((subtotal - discountAmount) * 0.085 * 100) / 100;
    let shipping = (subtotal - discountAmount) >= 35 ? 0 : 5.99;
    let total = Math.round((subtotal - discountAmount + tax + shipping) * 100) / 100;

    // Create order
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      discountAmount,
      total,
      discounts: cart.discounts,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      customerNotes,
      rewardPointsUsed,
      rewardPointsEarned: Math.floor(total) // 1 point per dollar
    });

    // Add initial status to history
    order.statusHistory.push({
      status: 'pending',
      note: 'Order created'
    });

    await order.save();

    // Update product stock and purchase counts
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: {
          stock: -item.quantity,
          purchases: item.quantity
        }
      });
    }

    // Update user reward points
    if (rewardPointsUsed > 0) {
      await user.useRewardPoints(rewardPointsUsed);
    }
    await user.addRewardPoints(order.rewardPointsEarned);

    // Clear cart
    await cart.clearCart();

    // Populate order for response
    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating order'
    });
  }
});

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const orders = await Order.find({ user: req.user.id })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images');

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: orders,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalOrders: total,
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching orders'
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private
 */
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user._id.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order'
    });
  }
});

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 */
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order status
    await order.updateStatus('cancelled', 'Cancelled by customer');

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: {
          stock: item.quantity,
          purchases: -item.quantity
        }
      });
    }

    // Refund reward points if used
    if (order.rewardPointsUsed > 0) {
      const user = await User.findById(req.user.id);
      await user.addRewardPoints(order.rewardPointsUsed);
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling order'
    });
  }
});

/**
 * @route   POST /api/orders/:id/return
 * @desc    Request order return
 * @access  Private
 */
router.post('/:id/return', protect, [
  body('returnReason').trim().notEmpty().withMessage('Return reason is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { returnReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to return this order'
      });
    }

    // Check if order can be returned
    if (!order.canBeReturned()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be returned (outside return window or not delivered)'
      });
    }

    // Update order
    order.returnRequested = true;
    order.returnReason = returnReason;
    await order.updateStatus('returned', `Return requested: ${returnReason}`);

    res.json({
      success: true,
      message: 'Return request submitted successfully',
      data: order
    });
  } catch (error) {
    console.error('Return order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing return request'
    });
  }
});

module.exports = router;
