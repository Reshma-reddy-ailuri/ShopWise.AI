import React from 'react'
import { useQuery } from 'react-query'
import { Link } from 'react-router-dom'
import { RotateCcw, ShoppingCart, Star, Package, ArrowRight } from 'lucide-react'
import { usersAPI } from '../../utils/api'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { formatCurrency, generateStarRating } from '../../utils/helpers'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'

const BuyAgain = ({ limit = 5, showTitle = true, className = '' }) => {
  const { user } = useAuth()
  const { addToCart } = useCart()

  // Fetch buy again products
  const { data: buyAgainData, isLoading, error } = useQuery(
    ['buyAgainProducts', user?.id, limit],
    () => usersAPI.getBuyAgainProducts(user.id, limit),
    {
      enabled: !!user?.id,
      staleTime: 10 * 60 * 1000, // 10 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
    }
  )

  const buyAgainProducts = buyAgainData?.data?.buyAgainProducts || []

  const handleAddToCart = async (productId, productName) => {
    try {
      const result = await addToCart(productId, 1)
      if (result.success) {
        toast.success(`${productName} added to cart!`)
      }
    } catch (error) {
      toast.error('Failed to add item to cart')
    }
  }

  const handleBuyAgain = async (productId, productName) => {
    await handleAddToCart(productId, productName)
  }

  // Don't render if user is not logged in
  if (!user) {
    return null
  }

  // Don't render if no products and not loading
  if (!isLoading && buyAgainProducts.length === 0) {
    return null
  }

  if (error) {
    console.error('Buy Again error:', error)
    return null
  }

  return (
    <div className={`bg-white rounded-lg shadow-soft ${className}`}>
      {showTitle && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Buy Again</h2>
              <p className="text-sm text-gray-600">Your frequently ordered items</p>
            </div>
          </div>
          {buyAgainProducts.length > 0 && (
            <Link
              to="/orders"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              View all orders
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
      )}

      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" text="Loading your favorites..." />
          </div>
        ) : buyAgainProducts.length > 0 ? (
          <div className="space-y-4">
            {buyAgainProducts.map((item) => (
              <div
                key={item.productId}
                className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
              >
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={item.product.images?.[0]?.url || '/images/placeholder.jpg'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                    {item.product.name}
                  </h3>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    {item.product.rating && (
                      <div className="flex items-center">
                        {generateStarRating(item.product.rating).slice(0, 5).map((star, index) => (
                          <Star
                            key={index}
                            className={`w-3 h-3 ${
                              star === 'full' ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">
                          ({item.product.rating?.toFixed(1)})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-gray-900">
                        {formatCurrency(item.product.price)}
                      </span>
                      <div className="flex items-center text-xs text-gray-500">
                        <Package className="w-3 h-3 mr-1" />
                        Ordered {item.orderStats.orderCount} time{item.orderStats.orderCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Last ordered date */}
                  <p className="text-xs text-gray-500 mt-1">
                    Last ordered: {new Date(item.orderStats.lastOrderDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleBuyAgain(item.productId, item.product.name)}
                    disabled={!item.product.isActive || item.product.stock === 0}
                    className="btn btn-primary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    Buy Again
                  </button>
                  
                  <Link
                    to={`/products/${item.productId}`}
                    className="btn btn-outline btn-sm text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}

            {/* View More Link */}
            {buyAgainProducts.length >= limit && (
              <div className="text-center pt-4 border-t border-gray-200">
                <Link
                  to="/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all order history →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Previous Orders</h3>
            <p className="text-gray-600 mb-6">
              Start shopping to see your frequently ordered items here
            </p>
            <Link
              to="/products"
              className="btn btn-primary"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyAgain
