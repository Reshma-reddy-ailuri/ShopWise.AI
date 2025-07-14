const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOrOwner } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching profile'
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Please provide a valid phone number')
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

    const { firstName, lastName, phone, preferences } = req.body;

    const user = await User.findById(req.user.id);
    
    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

/**
 * @route   POST /api/users/addresses
 * @desc    Add new address
 * @access  Private
 */
router.post('/addresses', protect, [
  body('type').isIn(['home', 'work', 'other']).withMessage('Address type must be home, work, or other'),
  body('street').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('zipCode').trim().notEmpty().withMessage('ZIP code is required'),
  body('country').optional().trim().notEmpty().withMessage('Country cannot be empty')
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

    const { type, street, city, state, zipCode, country = 'United States', isDefault = false } = req.body;

    const user = await User.findById(req.user.id);

    // If this is set as default, unset other default addresses
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Add new address
    user.addresses.push({
      type,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding address'
    });
  }
});

/**
 * @route   PUT /api/users/addresses/:addressId
 * @desc    Update address
 * @access  Private
 */
router.put('/addresses/:addressId', protect, [
  body('type').optional().isIn(['home', 'work', 'other']).withMessage('Address type must be home, work, or other'),
  body('street').optional().trim().notEmpty().withMessage('Street address cannot be empty'),
  body('city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('zipCode').optional().trim().notEmpty().withMessage('ZIP code cannot be empty')
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

    const { addressId } = req.params;
    const updateData = req.body;

    const user = await User.findById(req.user.id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // If setting as default, unset other default addresses
    if (updateData.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    // Update address fields
    Object.keys(updateData).forEach(key => {
      address[key] = updateData[key];
    });

    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating address'
    });
  }
});

/**
 * @route   DELETE /api/users/addresses/:addressId
 * @desc    Delete address
 * @access  Private
 */
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    const address = user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Remove address
    user.addresses.pull(addressId);
    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: user.addresses
    });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting address'
    });
  }
});

/**
 * @route   GET /api/users/order-history
 * @desc    Get user's order history with stats
 * @access  Private
 */
router.get('/order-history', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get orders
    const orders = await Order.find({ user: req.user.id })
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name images')
      .select('-statusHistory -adminNotes');

    // Get order statistics
    const stats = await Order.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' },
          averageOrderValue: { $avg: '$total' }
        }
      }
    ]);

    const orderStats = stats[0] || {
      totalOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0
    };

    const total = await Order.countDocuments({ user: req.user.id });

    res.json({
      success: true,
      data: {
        orders,
        stats: orderStats,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalOrders: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching order history'
    });
  }
});

/**
 * @route   GET /api/users/reward-points
 * @desc    Get user's reward points balance and history
 * @access  Private
 */
router.get('/reward-points', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get recent orders to show points earned
    const recentOrders = await Order.find({ 
      user: req.user.id,
      rewardPointsEarned: { $gt: 0 }
    })
    .sort({ orderDate: -1 })
    .limit(10)
    .select('orderNumber rewardPointsEarned orderDate total');

    res.json({
      success: true,
      data: {
        currentBalance: user.rewardPoints,
        recentEarnings: recentOrders,
        pointsValue: 'Each point = $1.00'
      }
    });
  } catch (error) {
    console.error('Get reward points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reward points'
    });
  }
});

/**
 * @route   GET /api/users/:id/buy-again
 * @desc    Get user's most frequently ordered products for "Buy Again" feature
 * @access  Private
 */
router.get('/:id/buy-again', protect, adminOrOwner, async (req, res) => {
  try {
    const userId = req.params.id;
    const limit = parseInt(req.query.limit) || 5;

    // Aggregate to find most frequently ordered products
    const buyAgainProducts = await Order.aggregate([
      // Match orders for this user
      { $match: { user: userId } },

      // Unwind the items array to work with individual products
      { $unwind: '$items' },

      // Group by product and count occurrences
      {
        $group: {
          _id: '$items.product',
          orderCount: { $sum: 1 },
          totalQuantity: { $sum: '$items.quantity' },
          lastOrderDate: { $max: '$orderDate' },
          avgPrice: { $avg: '$items.itemPrice' },
          // Keep product snapshot for fallback
          productSnapshot: { $first: '$items.productSnapshot' }
        }
      },

      // Sort by order frequency (most ordered first)
      { $sort: { orderCount: -1, lastOrderDate: -1 } },

      // Limit results
      { $limit: limit },

      // Lookup current product details
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },

      // Project final structure
      {
        $project: {
          _id: 1,
          orderCount: 1,
          totalQuantity: 1,
          lastOrderDate: 1,
          avgPrice: 1,
          product: { $arrayElemAt: ['$product', 0] },
          productSnapshot: 1
        }
      }
    ]);

    // Filter out products that no longer exist and enrich data
    const enrichedProducts = buyAgainProducts
      .filter(item => item.product || item.productSnapshot)
      .map(item => {
        const product = item.product || item.productSnapshot;

        return {
          productId: item._id,
          product: {
            _id: product._id,
            name: product.name,
            price: product.price || item.avgPrice,
            images: product.images || [],
            category: product.category,
            brand: product.brand,
            rating: product.rating,
            stock: product.stock,
            isActive: product.isActive !== false // Default to true if not specified
          },
          orderStats: {
            orderCount: item.orderCount,
            totalQuantity: item.totalQuantity,
            lastOrderDate: item.lastOrderDate,
            avgPrice: item.avgPrice
          }
        };
      })
      // Only include active products
      .filter(item => item.product.isActive);

    // Get user's recent order categories for additional recommendations
    const recentCategories = await Order.aggregate([
      { $match: { user: userId } },
      { $sort: { orderDate: -1 } },
      { $limit: 10 },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productSnapshot.category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    res.json({
      success: true,
      data: {
        buyAgainProducts: enrichedProducts,
        recentCategories: recentCategories.map(cat => cat._id).filter(Boolean),
        totalFound: enrichedProducts.length
      }
    });

  } catch (error) {
    console.error('Get buy again products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching buy again products'
    });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin or own profile)
 * @access  Private
 */
router.get('/:id', protect, adminOrOwner, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

module.exports = router;
