import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Package, Calendar, DollarSign, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/helpers'
import OrderStepper from './OrderStepper'
import { motion, AnimatePresence } from 'framer-motion'

const OrderCard = ({ order, showStepper = true, compact = false }) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // Get order status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'packed':
        return 'bg-indigo-100 text-indigo-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'returned':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Format status for display
  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Get primary product image
  const getPrimaryImage = () => {
    const firstItem = order.items?.[0]
    return firstItem?.product?.images?.[0]?.url || 
           firstItem?.productSnapshot?.images?.[0]?.url || 
           '/images/placeholder.jpg'
  }

  return (
    <div className="bg-white rounded-lg shadow-soft border border-gray-200 overflow-hidden">
      {/* Order Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                src={getPrimaryImage()}
                alt="Order item"
                className="w-12 h-12 object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Order #{order.orderNumber}
              </h3>
              <p className="text-sm text-gray-600">
                {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
              {formatStatus(order.status)}
            </span>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              {formatCurrency(order.total)}
            </p>
          </div>
        </div>

        {/* Order Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {formatDate(order.orderDate)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {order.items?.length} items
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {formatCurrency(order.total)}
            </span>
          </div>
          
          {order.shippingAddress && (
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 truncate">
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </span>
            </div>
          )}
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span className="text-sm font-medium">
            {isExpanded ? 'Hide Details' : 'View Details'}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Order Progress Stepper */}
              {showStepper && (
                <div>
                  <OrderStepper
                    currentStatus={order.status}
                    orderDate={order.orderDate}
                    statusHistory={order.statusHistory}
                    estimatedDelivery={order.estimatedDelivery}
                    size={compact ? 'compact' : 'default'}
                  />
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                <div className="space-y-3">
                  {order.items?.map((item, index) => {
                    const product = item.product || item.productSnapshot
                    return (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={product?.images?.[0]?.url || '/images/placeholder.jpg'}
                          alt={product?.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-gray-900 line-clamp-2">
                            {product?.name}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(item.itemPrice)}
                          </p>
                        </div>
                        {product?._id && (
                          <Link
                            to={`/products/${product._id}`}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Product
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {order.shippingAddress && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p>{order.shippingAddress.street}</p>
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Summary</h4>
                <div className="bg-gray-50 p-3 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax:</span>
                      <span className="text-gray-900">{formatCurrency(order.tax)}</span>
                    </div>
                  )}
                  {order.shipping > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="text-gray-900">{formatCurrency(order.shipping)}</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-medium">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <Link
                  to={`/orders/${order._id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Full Details
                </Link>
                
                {order.status === 'delivered' && (
                  <button className="btn btn-outline btn-sm">
                    Return Items
                  </button>
                )}
                
                {['pending', 'confirmed'].includes(order.status) && (
                  <button className="btn btn-outline btn-sm text-red-600 border-red-300 hover:bg-red-50">
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default OrderCard
