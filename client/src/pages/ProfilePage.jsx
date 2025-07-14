import React from 'react'
import { User, Settings, MapPin, CreditCard, RotateCcw, Package } from 'lucide-react'
import { useQuery } from 'react-query'
import { ordersAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import BuyAgain from '../components/UI/BuyAgain'
import OrderStepper from '../components/UI/OrderStepper'
import LoadingSpinner from '../components/UI/LoadingSpinner'

const ProfilePage = () => {
  const { user } = useAuth()

  // Fetch recent orders for progress tracking
  const { data: recentOrdersData, isLoading: ordersLoading } = useQuery(
    ['recent-orders', user?.id],
    () => ordersAPI.getOrders({ limit: 3, status: 'shipped,processing,packed' }),
    {
      enabled: !!user,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  const recentOrders = recentOrdersData?.data?.orders || []

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-walmart-blue rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">John Doe</h3>
                <p className="text-gray-500">john.doe@example.com</p>
              </div>
              
              <nav className="space-y-2">
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-walmart-blue bg-blue-50 rounded-lg">
                  <User className="w-4 h-4 mr-3" />
                  Profile Information
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <MapPin className="w-4 h-4 mr-3" />
                  Addresses
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <CreditCard className="w-4 h-4 mr-3" />
                  Payment Methods
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <RotateCcw className="w-4 h-4 mr-3" />
                  Buy Again
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
                  <Settings className="w-4 h-4 mr-3" />
                  Settings
                </a>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>

              <div className="text-center py-16">
                <Settings className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management Coming Soon</h3>
                <p className="text-gray-600">
                  Profile editing, address management, and account settings are currently under development.
                </p>
              </div>
            </div>

            {/* Recent Order Progress */}
            {recentOrders.length > 0 && (
              <div className="bg-white rounded-lg shadow-soft p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Order Progress</h2>

                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" text="Loading order progress..." />
                  </div>
                ) : (
                  <div className="space-y-8">
                    {recentOrders.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} • {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${order.total?.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        <OrderStepper
                          currentStatus={order.status}
                          orderDate={order.orderDate}
                          statusHistory={order.statusHistory}
                          estimatedDelivery={order.estimatedDelivery}
                          size="compact"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Buy Again Section */}
            <BuyAgain limit={8} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
