import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2, Plus, Minus, ShoppingBag, AlertTriangle, DollarSign, TrendingDown } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { formatCurrency, storage } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import BuyAgain from '../components/UI/BuyAgain'
import { useQuery } from 'react-query'
import { productsAPI } from '../utils/api'

const CartPage = () => {
  const {
    items,
    subtotal,
    tax,
    shipping,
    total,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart()
  const { isAuthenticated } = useAuth()

  // Budget management state
  const [budgetLimit, setBudgetLimit] = useState(() => {
    return storage.get('cart-budget-limit', 0)
  })
  const [showBudgetInput, setShowBudgetInput] = useState(false)
  const [tempBudgetValue, setTempBudgetValue] = useState('')
  const [showAlternatives, setShowAlternatives] = useState(false)

  // Check if budget is exceeded
  const isBudgetExceeded = budgetLimit > 0 && total > budgetLimit
  const budgetOverage = isBudgetExceeded ? total - budgetLimit : 0

  // Get categories from cart items for finding alternatives
  const cartCategories = [...new Set(items.map(item => item.product?.category || item.productSnapshot?.category).filter(Boolean))]

  // Fetch cheaper alternatives when budget is exceeded
  const { data: alternatives } = useQuery(
    ['cheaper-alternatives', cartCategories, budgetLimit],
    async () => {
      if (!isBudgetExceeded || cartCategories.length === 0) return []

      const allAlternatives = []
      for (const category of cartCategories) {
        try {
          const categoryProducts = await productsAPI.getProducts({
            category,
            maxPrice: Math.floor(budgetOverage / 2), // Look for products that could help reduce overage
            sort: 'price_asc',
            limit: 3
          })
          allAlternatives.push(...(categoryProducts.data || []))
        } catch (error) {
          console.error('Error fetching alternatives:', error)
        }
      }

      // Return top 2 unique alternatives
      const uniqueAlternatives = allAlternatives
        .filter((product, index, self) =>
          index === self.findIndex(p => p._id === product._id) &&
          !items.some(item => item.product?._id === product._id || item.productSnapshot?._id === product._id)
        )
        .slice(0, 2)

      return uniqueAlternatives
    },
    {
      enabled: isBudgetExceeded && cartCategories.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Save budget limit to localStorage
  useEffect(() => {
    if (budgetLimit > 0) {
      storage.set('cart-budget-limit', budgetLimit)
    }
  }, [budgetLimit])

  // Show alternatives when budget is exceeded and alternatives are loaded
  useEffect(() => {
    if (isBudgetExceeded && alternatives && alternatives.length > 0) {
      setShowAlternatives(true)
    } else {
      setShowAlternatives(false)
    }
  }, [isBudgetExceeded, alternatives])

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity === 0) {
      await removeFromCart(itemId)
    } else {
      await updateQuantity(itemId, newQuantity)
    }
  }

  const handleSetBudget = () => {
    const budget = parseFloat(tempBudgetValue)
    if (budget > 0) {
      setBudgetLimit(budget)
      setShowBudgetInput(false)
      setTempBudgetValue('')
    }
  }

  const handleRemoveBudget = () => {
    setBudgetLimit(0)
    storage.remove('cart-budget-limit')
  }

  const handleAddToCart = async (productId, quantity = 1) => {
    // This would typically use the cart context's addToCart method
    // For now, we'll just show a success message
    try {
      // await addToCart(productId, quantity)
      console.log(`Adding product ${productId} to cart`)
      // You could also redirect to the product page or show a toast
    } catch (error) {
      console.error('Error adding to cart:', error)
    }
  }

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading cart..." />
        </div>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Add some products to get started!</p>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 text-sm font-medium"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-soft">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Cart Items ({items.length})
              </h2>
              
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product?.images?.[0]?.url || '/images/placeholder.jpg'}
                      alt={item.productSnapshot?.name || 'Product'}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {item.productSnapshot?.name || item.product?.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        SKU: {item.productSnapshot?.sku || item.product?.sku}
                      </p>
                      {item.selectedVariants?.length > 0 && (
                        <div className="text-sm text-gray-500">
                          {item.selectedVariants.map((variant, index) => (
                            <span key={index}>
                              {variant.name}: {variant.value}
                              {index < item.selectedVariants.length - 1 && ', '}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        disabled={loading}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      
                      <button
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="p-1 rounded-full hover:bg-gray-100"
                        disabled={loading || item.quantity >= (item.product?.stock || 0)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(item.itemPrice * item.quantity)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(item.itemPrice)} each
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full"
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-soft p-6 sticky top-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

            {/* Budget Limit Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Budget Limit
                </h3>
                {budgetLimit > 0 && (
                  <button
                    onClick={handleRemoveBudget}
                    className="text-xs text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>

              {budgetLimit > 0 ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Your Budget:</span>
                    <span className="font-medium">{formatCurrency(budgetLimit)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current Total:</span>
                    <span className={`font-medium ${isBudgetExceeded ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(total)}
                    </span>
                  </div>
                  {isBudgetExceeded && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Over Budget:</span>
                      <span className="font-medium text-red-600">
                        +{formatCurrency(budgetOverage)}
                      </span>
                    </div>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isBudgetExceeded ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((total / budgetLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <button
                    onClick={() => setShowBudgetInput(true)}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Update Budget
                  </button>
                </div>
              ) : (
                <div>
                  {!showBudgetInput ? (
                    <button
                      onClick={() => setShowBudgetInput(true)}
                      className="w-full text-sm bg-blue-50 text-blue-600 py-2 px-3 rounded border-2 border-dashed border-blue-300 hover:bg-blue-100 transition-colors"
                    >
                      + Set Budget Limit
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={tempBudgetValue}
                        onChange={(e) => setTempBudgetValue(e.target.value)}
                        placeholder="Enter budget amount"
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={handleSetBudget}
                          className="flex-1 text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors"
                        >
                          Set Budget
                        </button>
                        <button
                          onClick={() => {
                            setShowBudgetInput(false)
                            setTempBudgetValue('')
                          }}
                          className="flex-1 text-xs bg-gray-300 text-gray-700 py-2 px-3 rounded hover:bg-gray-400 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-semibold text-gray-900">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            {shipping === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <p className="text-green-800 text-sm font-medium">
                  🎉 You qualify for free shipping!
                </p>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-blue-800 text-sm">
                  Add {formatCurrency(35 - subtotal)} more for free shipping
                </p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full btn btn-primary btn-lg text-center"
              >
                Proceed to Checkout
              </Link>
              
              <Link
                to="/products"
                className="w-full btn btn-outline text-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Security badges */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  Secure Checkout
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                  SSL Encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Buy Again Section - Only show for authenticated users with items in cart */}
      {isAuthenticated && items.length > 0 && (
        <div className="mt-8">
          <BuyAgain limit={3} className="border-t border-gray-200 pt-8" />
        </div>
      )}

      {/* Budget Warning Alert */}
      {isBudgetExceeded && (
        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">Budget Limit Exceeded!</h3>
              <p className="text-red-700 mb-3">
                Your cart total of <strong>{formatCurrency(total)}</strong> exceeds your budget limit of{' '}
                <strong>{formatCurrency(budgetLimit)}</strong> by <strong>{formatCurrency(budgetOverage)}</strong>.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
                >
                  {showAlternatives ? 'Hide' : 'Show'} Cheaper Alternatives
                </button>
                <button
                  onClick={() => setShowBudgetInput(true)}
                  className="text-sm bg-white text-red-700 border border-red-300 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                >
                  Increase Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cheaper Alternatives Section */}
      {showAlternatives && alternatives && alternatives.length > 0 && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <TrendingDown className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="font-semibold text-blue-900">Suggested Cheaper Alternatives</h3>
          </div>
          <p className="text-blue-700 text-sm mb-4">
            Here are some budget-friendly alternatives from the same categories:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alternatives.map((product) => (
              <div key={product._id} className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex space-x-3">
                  <img
                    src={product.images?.[0]?.url || '/images/placeholder.jpg'}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                      {product.name}
                    </h4>
                    <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-green-600">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-gray-500 line-through ml-1">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Link
                          to={`/products/${product._id}`}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleAddToCart(product._id, 1)}
                          className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <Link
              to={`/products?maxPrice=${Math.floor(budgetOverage)}&category=${cartCategories[0]}`}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse more budget-friendly options →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartPage
