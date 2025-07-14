import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { ArrowLeft, Package, MapPin, CreditCard, Truck, Download } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import { formatCurrency, formatDate } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import OrderStepper from '../components/UI/OrderStepper'

const OrderDetailPage = () => {
  const { id } = useParams()

  // Fetch order details
  const { data: orderData, isLoading, error } = useQuery(
    ['order', id],
    () => ordersAPI.getOrder(id),
    {
      enabled: !!id,
    }
  )

  const order = orderData?.data

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center">
          <LoadingSpinner size="lg" text="Loading order details..." />
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Link to="/orders" className="btn btn-primary">
            Back to Orders
          </Link>
        </div>
      </div>
    )
  }

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

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="container py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/orders"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order.orderNumber}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {formatDate(order.orderDate)}
              </p>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {formatStatus(order.status)}
              </span>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(order.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Progress */}
        <div className="bg-white rounded-lg shadow-soft p-6 mb-8">
          <OrderStepper
            currentStatus={order.status}
            orderDate={order.orderDate}
            statusHistory={order.statusHistory}
            estimatedDelivery={order.estimatedDelivery}
            size="large"
          />
        </div>

        {/* Simplified Order Items for now */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Items</h2>

          <div className="space-y-4">
            {order.items?.map((item, index) => {
              const product = item.product || item.productSnapshot
              return (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={product?.images?.[0]?.url || '/images/placeholder.jpg'}
                    alt={product?.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-2">
                      {product?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: {formatCurrency(item.itemPrice)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.itemPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailPage
