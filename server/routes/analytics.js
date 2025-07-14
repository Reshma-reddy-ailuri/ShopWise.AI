const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard analytics data
 * @access  Private/Admin
 */
router.get('/dashboard', protect, adminOnly, async (req, res) => {
  try {
    const { period = '12months' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '3months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      case '12months':
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        break;
    }

    // Revenue data by month
    const revenueData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Category-wise sales data
    const categoryData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productSnapshot.category',
          revenue: { $sum: { $multiply: ['$items.quantity', '$items.itemPrice'] } },
          quantity: { $sum: '$items.quantity' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { revenue: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Top-selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productSnapshot.name' },
          category: { $first: '$items.productSnapshot.category' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.itemPrice'] } },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Overall statistics
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      }
    ]);

    // User growth data
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Order status distribution
    const orderStatusData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent orders for activity feed
    const recentOrders = await Order.find({
      orderDate: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
    })
    .populate('user', 'firstName lastName email')
    .sort({ orderDate: -1 })
    .limit(10)
    .select('orderNumber total status orderDate user');

    res.json({
      success: true,
      data: {
        period,
        dateRange: {
          start: startDate,
          end: now
        },
        revenue: {
          monthly: revenueData,
          total: totalRevenue[0] || { total: 0, orders: 0, avgOrderValue: 0 }
        },
        categories: categoryData,
        topProducts,
        userGrowth,
        orderStatus: orderStatusData,
        recentActivity: recentOrders,
        summary: {
          totalRevenue: totalRevenue[0]?.total || 0,
          totalOrders: totalRevenue[0]?.orders || 0,
          avgOrderValue: totalRevenue[0]?.avgOrderValue || 0,
          totalCategories: categoryData.length,
          topCategory: categoryData[0]?.name || 'N/A'
        }
      }
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching analytics data'
    });
  }
});

/**
 * @route   GET /api/analytics/revenue
 * @desc    Get detailed revenue analytics
 * @access  Private/Admin
 */
router.get('/revenue', protect, adminOnly, async (req, res) => {
  try {
    const { period = '12months', granularity = 'month' } = req.query;
    
    // Calculate date range
    const now = new Date();
    let startDate;
    let groupBy;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupBy = granularity === 'day' ? {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
          day: { $dayOfMonth: '$orderDate' }
        } : {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        };
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupBy = granularity === 'day' ? {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' },
          day: { $dayOfMonth: '$orderDate' }
        } : {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        };
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        groupBy = {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        };
    }

    const revenueData = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$total' },
          orders: { $sum: 1 },
          avgOrderValue: { $avg: '$total' }
        }
      },
      {
        $sort: { 
          '_id.year': 1, 
          '_id.month': 1, 
          '_id.day': 1 
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        granularity,
        revenue: revenueData
      }
    });

  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching revenue data'
    });
  }
});

/**
 * @route   GET /api/analytics/products
 * @desc    Get product performance analytics
 * @access  Private/Admin
 */
router.get('/products', protect, adminOnly, async (req, res) => {
  try {
    const { period = '30days', limit = 20 } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
    }

    const productAnalytics = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: startDate },
          status: { $in: ['delivered', 'shipped'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productSnapshot.name' },
          category: { $first: '$items.productSnapshot.category' },
          brand: { $first: '$items.productSnapshot.brand' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.itemPrice'] } },
          orders: { $sum: 1 },
          avgPrice: { $avg: '$items.itemPrice' }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json({
      success: true,
      data: {
        period,
        products: productAnalytics
      }
    });

  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching product analytics'
    });
  }
});

module.exports = router;
