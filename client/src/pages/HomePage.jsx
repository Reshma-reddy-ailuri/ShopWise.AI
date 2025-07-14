import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { useTranslation } from 'react-i18next'
import {
  ShoppingBag,
  Truck,
  Shield,
  Headphones,
  ArrowRight,
  Star,
  Zap,
  Package
} from 'lucide-react'
import { productsAPI, ordersAPI } from '../utils/api'
import { formatCurrency, generateStarRating } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import BuyAgain from '../components/UI/BuyAgain'
import OrderStepper from '../components/UI/OrderStepper'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import AIAssistantModal from '../components/UI/AIAssistantModal'
import toast from 'react-hot-toast'

const HomePage = () => {
  const { addToCart } = useCart()
  const { isAuthenticated } = useAuth()
  const { formatCurrency: formatLocalizedCurrency } = useLanguage()
  const { t } = useTranslation()
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false)

  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery(
    'featuredProducts',
    () => productsAPI.getFeaturedProducts(8),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  // Fetch active orders for authenticated users
  const { data: activeOrdersData } = useQuery(
    ['active-orders', isAuthenticated],
    () => ordersAPI.getOrders({
      limit: 2,
      status: 'pending,confirmed,processing,packed,shipped'
    }),
    {
      enabled: isAuthenticated,
      staleTime: 2 * 60 * 1000, // 2 minutes
    }
  )

  // Fetch categories
  const { data: categories } = useQuery(
    'categories',
    () => productsAPI.getCategories(),
    {
      staleTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const activeOrders = activeOrdersData?.data?.orders || []

  const handleAddToCart = async (productId) => {
    const result = await addToCart(productId, 1)
    if (result.success) {
      toast.success('Added to cart!')
    }
  }

  const features = [
    {
      icon: <Truck className="w-8 h-8" />,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $35'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Shopping',
      description: '100% secure payment processing'
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer service'
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: 'AI Powered',
      description: 'Smart recommendations just for you'
    }
  ]

  const aiFeatures = [
    {
      icon: '🤖',
      title: 'AI Shopping Assistant',
      description: 'Get personalized product recommendations through voice, text, or image search'
    },
    {
      icon: '✨',
      title: 'Virtual Try-On',
      description: 'See how clothes, accessories, and shoes look on you before buying'
    },
    {
      icon: '🎯',
      title: 'Smart Recommendations',
      description: 'AI analyzes your preferences to suggest products you\'ll love'
    },
    {
      icon: '📱',
      title: 'Visual Search',
      description: 'Upload photos to find similar products instantly'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-walmart-blue to-blue-700 text-white">
        <div className="container py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t('homepage.heroTitle')}
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                {t('homepage.heroSubtitle')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/products"
                  className="btn btn-lg bg-walmart-yellow text-gray-900 hover:bg-yellow-400 font-semibold"
                >
                  {t('homepage.shopNow')}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button
                  onClick={() => setIsAIAssistantOpen(true)}
                  className="btn btn-lg btn-outline border-white text-white hover:bg-white hover:text-walmart-blue"
                >
                  Try AI Assistant
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center">
                  <ShoppingBag className="w-24 h-24 mx-auto mb-4 text-walmart-yellow" />
                  <h3 className="text-2xl font-bold mb-2">AI Shopping Assistant</h3>
                  <p className="text-blue-100">
                    Voice, image, and text-powered product discovery
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active Orders Section - Only show for authenticated users with active orders */}
      {isAuthenticated && activeOrders.length > 0 && (
        <section className="py-12 bg-blue-50">
          <div className="container">
            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Track Your Orders</h2>
                    <p className="text-sm text-gray-600">Follow your recent order progress</p>
                  </div>
                </div>
                <Link
                  to="/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                  View all orders
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-6">
                {activeOrders.map((order) => (
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
            </div>
          </div>
        </section>
      )}

      {/* Buy Again Section - Only show for authenticated users */}
      {isAuthenticated && (
        <section className="py-12 bg-gray-50">
          <div className="container">
            <BuyAgain limit={4} />
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-blue-50 text-walmart-blue w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </div>
          
          {categories && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${encodeURIComponent(category._id)}`}
                  className="bg-white rounded-lg p-6 text-center hover:shadow-medium transition-shadow duration-300 group"
                >
                  <div className="text-4xl mb-3">
                    {getCategoryIcon(category._id)}
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-walmart-blue transition-colors">
                    {category._id}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.count} products
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Featured Products</h2>
            <p className="text-xl text-gray-600">Handpicked deals just for you</p>
          </div>

          {featuredLoading ? (
            <div className="flex justify-center">
              <LoadingSpinner size="lg" text="Loading featured products..." />
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts?.map((product) => (
                <div key={product._id} className="product-card">
                  <div className="relative">
                    <img
                      src={product.images[0]?.url || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {product.isOnSale && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                        Sale
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {generateStarRating(product.rating).map((star, index) => (
                          <Star
                            key={index}
                            className={`w-4 h-4 ${
                              star === 'full' 
                                ? 'text-yellow-400 fill-current' 
                                : star === 'half'
                                ? 'text-yellow-400 fill-current opacity-50'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({product.numReviews})
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatCurrency(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/products/${product._id}`}
                        className="flex-1 btn btn-outline text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => handleAddToCart(product._id)}
                        className="flex-1 btn btn-primary"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="btn btn-lg btn-primary"
            >
              View All Products
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="ai-features" className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by <span className="text-gradient">Artificial Intelligence</span>
            </h2>
            <p className="text-xl text-gray-600">
              Experience the future of shopping with our AI-powered features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-soft hover:shadow-medium transition-shadow duration-300">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-2xl p-8 max-w-2xl mx-auto shadow-soft">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Try Virtual Try-On</h3>
              <p className="text-gray-600 mb-6">
                See how clothes and accessories look on you with our AI-powered virtual try-on technology
              </p>
              <Link
                to="/products?category=Clothing"
                className="btn btn-primary btn-lg"
              >
                <Zap className="w-5 h-5 mr-2" />
                Explore Fashion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="container text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Join millions of satisfied customers and discover amazing deals today
          </p>
          <Link
            to="/register"
            className="btn btn-lg bg-white text-purple-600 hover:bg-gray-100 font-semibold"
          >
            Create Account
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* AI Assistant Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
      />
    </div>
  )
}

// Helper function to get category icons
const getCategoryIcon = (category) => {
  const icons = {
    'Electronics': '📱',
    'Clothing': '👕',
    'Home & Garden': '🏠',
    'Sports & Outdoors': '⚽',
    'Health & Beauty': '💄',
    'Toys & Games': '🎮',
    'Books': '📚',
    'Automotive': '🚗',
    'Grocery': '🛒'
  }
  return icons[category] || '📦'
}

export default HomePage
