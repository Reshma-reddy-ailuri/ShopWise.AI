import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { useSearchParams } from 'react-router-dom'
import { Filter, Grid, List, Star } from 'lucide-react'
import { productsAPI } from '../utils/api'
import { formatCurrency, generateStarRating } from '../utils/helpers'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import { useCart } from '../context/CartContext'
import { Link } from 'react-router-dom'

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState('grid')
  const { addToCart } = useCart()

  // Get filters from URL params
  const page = parseInt(searchParams.get('page')) || 1
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''

  // Fetch products
  const { data: productsData, isLoading } = useQuery(
    ['products', page, search, category, sort, minPrice, maxPrice],
    () => productsAPI.getProducts({
      page,
      search: search || undefined,
      category: category || undefined,
      sort,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      limit: 12
    }),
    {
      keepPreviousData: true,
    }
  )

  // Fetch categories for filter
  const { data: categories } = useQuery('categories', () => productsAPI.getCategories())

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams)
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.set('page', '1') // Reset to first page
    setSearchParams(params)
  }

  const handleAddToCart = async (productId) => {
    await addToCart(productId, 1)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" text="Loading products..." />
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {search ? `Search results for "${search}"` : 
           category ? `${category} Products` : 
           'All Products'}
        </h1>
        <p className="text-gray-600">
          {productsData?.pagination?.totalProducts || 0} products found
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 space-y-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h3>

            {/* Categories */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Categories</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={!category}
                    onChange={() => updateFilters({ category: '' })}
                    className="text-walmart-blue focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">All Categories</span>
                </label>
                {categories?.map((cat) => (
                  <label key={cat._id} className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      checked={category === cat._id}
                      onChange={() => updateFilters({ category: cat._id })}
                      className="text-walmart-blue focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      {cat._id} ({cat.count})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateFilters({ minPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateFilters({ maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          {/* Sort and View Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <select
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Products */}
          {productsData?.data?.length > 0 ? (
            <div className={viewMode === 'grid' ? 'product-grid' : 'space-y-4'}>
              {productsData.data.map((product) => (
                <div key={product._id} className={viewMode === 'grid' ? 'product-card' : 'bg-white rounded-lg shadow-soft p-6 flex'}>
                  {viewMode === 'grid' ? (
                    // Grid View
                    <>
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
                                  star === 'full' ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">({product.numReviews})</span>
                        </div>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-xl font-bold text-gray-900">
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
                    </>
                  ) : (
                    // List View
                    <>
                      <img
                        src={product.images[0]?.url || '/images/placeholder.jpg'}
                        alt={product.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="ml-6 flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-gray-600 mb-3 line-clamp-2">{product.shortDescription}</p>
                        <div className="flex items-center mb-3">
                          <div className="flex items-center">
                            {generateStarRating(product.rating).map((star, index) => (
                              <Star
                                key={index}
                                className={`w-4 h-4 ${
                                  star === 'full' ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-2">({product.numReviews} reviews)</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-2xl font-bold text-gray-900">
                              {formatCurrency(product.price)}
                            </span>
                            {product.originalPrice && product.originalPrice > product.price && (
                              <span className="text-lg text-gray-500 line-through ml-2">
                                {formatCurrency(product.originalPrice)}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/products/${product._id}`}
                              className="btn btn-outline"
                            >
                              View Details
                            </Link>
                            <button
                              onClick={() => handleAddToCart(product._id)}
                              className="btn btn-primary"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
            </div>
          )}

          {/* Pagination */}
          {productsData?.pagination && productsData.pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => updateFilters({ page: page - 1 })}
                  disabled={!productsData.pagination.hasPrevPage}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {page} of {productsData.pagination.totalPages}
                </span>
                <button
                  onClick={() => updateFilters({ page: page + 1 })}
                  disabled={!productsData.pagination.hasNextPage}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
