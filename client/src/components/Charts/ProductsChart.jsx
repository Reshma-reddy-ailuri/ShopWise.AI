import React from 'react'
import { Bar } from 'react-chartjs-2'
import { productsChartOptions, formatChartData } from '../../utils/chartConfig'
import { BarChart3, Package, Star, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../context/LanguageContext'

const ProductsChart = ({ 
  data = [], 
  isLoading = false,
  className = '' 
}) => {
  const { t } = useTranslation()
  const { formatCurrency } = useLanguage()

  // Calculate summary statistics
  const totalQuantity = data.reduce((sum, item) => sum + item.totalQuantity, 0)
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0)
  const topProduct = data[0] || null

  const chartData = formatChartData.products(data)

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
            Top Selling Products
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Best performing products by quantity sold
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Total Units Sold</p>
              <p className="text-2xl font-bold text-green-600">
                {totalQuantity.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        {topProduct && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center">
              <Star className="w-8 h-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Top Product</p>
                <p className="text-lg font-bold text-yellow-600 line-clamp-1">
                  {topProduct.productName?.substring(0, 20) + '...' || 'Unknown'}
                </p>
                <p className="text-xs text-yellow-700">
                  {topProduct.totalQuantity.toLocaleString()} units
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        {data.length > 0 ? (
          <Bar data={chartData} options={productsChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Product Data</p>
              <p className="text-sm">No product sales data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      {data.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Product Performance</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity Sold
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(0, 10).map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {product.productName || 'Unknown Product'}
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <span className="font-medium">
                          {product.totalQuantity.toLocaleString()}
                        </span>
                        <span className="text-gray-500 ml-1">units</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(product.totalRevenue)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.avgPrice || (product.totalRevenue / product.totalQuantity))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {data.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Product Insights</h4>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-green-900">Sales Performance</p>
                <ul className="text-sm text-green-800 mt-2 space-y-1">
                  {topProduct && (
                    <li>
                      • <strong>{topProduct.productName?.substring(0, 30) || 'Top product'}</strong> leads with {topProduct.totalQuantity.toLocaleString()} units sold
                    </li>
                  )}
                  {data.length >= 3 && (
                    <li>
                      • Top 3 products account for {
                        ((data.slice(0, 3).reduce((sum, prod) => sum + prod.totalQuantity, 0) / totalQuantity) * 100).toFixed(1)
                      }% of total units sold
                    </li>
                  )}
                  {data.length >= 5 && (
                    <li>
                      • Average revenue per product: {formatCurrency(totalRevenue / data.length)}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsChart
