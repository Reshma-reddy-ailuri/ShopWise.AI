import React, { useState } from 'react'
import { useQuery } from 'react-query'
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Grid3X3
} from 'lucide-react'
import { adminAPI } from '../../utils/api'
import { formatCurrency } from '../../utils/helpers'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import AnalyticsDashboard from '../../components/Admin/AnalyticsDashboard'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const { data: dashboardData, isLoading } = useQuery(
    'adminDashboard',
    () => adminAPI.getDashboard(),
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    }
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Grid3X3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    )
  }

  const stats = [
    {
      name: 'Total Users',
      value: dashboardData?.users?.total || 0,
      change: `+${dashboardData?.users?.newThisMonth || 0} this month`,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Products',
      value: dashboardData?.products?.total || 0,
      change: `${dashboardData?.products?.lowStock || 0} low stock`,
      icon: Package,
      color: 'bg-green-500'
    },
    {
      name: 'Total Orders',
      value: dashboardData?.orders?.total || 0,
      change: `+${dashboardData?.orders?.today || 0} today`,
      icon: ShoppingCart,
      color: 'bg-purple-500'
    },
    {
      name: 'Total Revenue',
      value: formatCurrency(dashboardData?.revenue?.total || 0),
      change: `${formatCurrency(dashboardData?.revenue?.monthly || 0)} this month`,
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome to your store management dashboard</p>

        {/* Tab Navigation */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <>
          {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="p-6">
            {dashboardData?.recentOrders?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentOrders.map((order) => (
                  <div key={order._id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {formatCurrency(order.total)}
                      </p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-lg shadow-soft">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
          </div>
          <div className="p-6">
            {dashboardData?.topProducts?.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.topProducts.map((product) => (
                  <div key={product._id} className="flex items-center">
                    <img
                      src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">
                        {product.purchases} sold • {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No product data</p>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {dashboardData?.products?.lowStock > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800">
              <span className="font-medium">{dashboardData.products.lowStock} products</span> are running low on stock.
            </p>
          </div>
        </div>
      )}
        </>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <AnalyticsDashboard />
      )}
    </div>
  )
}

export default AdminDashboard
