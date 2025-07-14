import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { Star, ShoppingCart, Heart, Share2, ArrowLeft, Sparkles } from 'lucide-react'
import { productsAPI } from '../utils/api'
import { formatCurrency, generateStarRating } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useCart } from '../context/CartContext'
import VirtualTryOn from '../components/AI/VirtualTryOn'

const ProductDetailPage = () => {
  const { id } = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [showVirtualTryOn, setShowVirtualTryOn] = useState(false)
  const { addToCart } = useCart()

  const { data: product, isLoading } = useQuery(
    ['product', id],
    () => productsAPI.getProduct(id),
    {
      enabled: !!id,
    }
  )

  const handleAddToCart = async () => {
    await addToCart(product._id, quantity)
  }

  // Check if product is suitable for virtual try-on
  const isTryOnCompatible = () => {
    const compatibleCategories = ['Clothing', 'Accessories', 'Shoes', 'Jewelry', 'Eyewear']
    const compatibleKeywords = ['shirt', 'dress', 'jacket', 'shoes', 'glasses', 'hat', 'watch', 'necklace']

    return compatibleCategories.includes(product?.category) ||
           compatibleKeywords.some(keyword =>
             product?.name?.toLowerCase().includes(keyword) ||
             product?.description?.toLowerCase().includes(keyword)
           )
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading product..." />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <Link to="/" className="hover:text-gray-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-gray-700">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category}`} className="hover:text-gray-700">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          <div className="mb-4">
            <img
              src={product.images[selectedImage]?.url || '/images/placeholder.jpg'}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          {product.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-gray-600">{product.shortDescription}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {generateStarRating(product.rating).map((star, index) => (
                <Star
                  key={index}
                  className={`w-5 h-5 ${
                    star === 'full' ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {product.rating.toFixed(1)} ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(product.originalPrice)}
                  </span>
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stock > 0 ? (
              <div className="flex items-center text-green-600">
                <span className="font-medium">In Stock</span>
                <span className="ml-2 text-sm text-gray-500">({product.stock} available)</span>
              </div>
            ) : (
              <span className="text-red-600 font-medium">Out of Stock</span>
            )}
          </div>

          {/* Quantity and Add to Cart */}
          {product.stock > 0 && (
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <label className="text-sm font-medium text-gray-700">Quantity:</label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-2"
                >
                  {[...Array(Math.min(product.stock, 10))].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 btn btn-primary btn-lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Add to Cart
                  </button>
                  <button className="btn btn-outline">
                    <Heart className="w-5 h-5" />
                  </button>
                  <button className="btn btn-outline">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Virtual Try-On Button */}
                {isTryOnCompatible() && (
                  <button
                    onClick={() => setShowVirtualTryOn(true)}
                    className="w-full btn bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 btn-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try On Virtually with AI
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Product Details */}
          <div className="border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
            <div className="space-y-3">
              <div className="flex">
                <span className="w-24 text-sm text-gray-500">Brand:</span>
                <span className="text-sm text-gray-900">{product.brand}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-sm text-gray-500">SKU:</span>
                <span className="text-sm text-gray-900">{product.sku}</span>
              </div>
              <div className="flex">
                <span className="w-24 text-sm text-gray-500">Category:</span>
                <span className="text-sm text-gray-900">{product.category}</span>
              </div>
              {product.specifications?.map((spec, index) => (
                <div key={index} className="flex">
                  <span className="w-24 text-sm text-gray-500">{spec.name}:</span>
                  <span className="text-sm text-gray-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Description and Reviews */}
      <div className="mt-16">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
              Description
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Reviews ({product.numReviews})
            </button>
          </nav>
        </div>

        <div className="py-8">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Virtual Try-On Modal */}
      <VirtualTryOn
        product={product}
        isOpen={showVirtualTryOn}
        onClose={() => setShowVirtualTryOn(false)}
      />
    </div>
  )
}

export default ProductDetailPage
