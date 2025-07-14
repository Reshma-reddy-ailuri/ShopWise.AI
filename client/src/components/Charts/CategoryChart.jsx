import React from 'react'
import { Pie } from 'react-chartjs-2'
import { categoryChartOptions, formatChartData } from '../../utils/chartConfig'
import { PieChart, Package, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../context/LanguageContext'

const CategoryChart = ({ 
  data = [], 
  isLoading = false,
  className = '' 
}) => {
  const { t } = useTranslation()
  const { formatCurrency } = useLanguage()

  // Calculate total revenue and top category
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const topCategory = data[0] || null
  const topCategoryPercentage = topCategory && totalRevenue > 0 
    ? ((topCategory.revenue / totalRevenue) * 100).toFixed(1)
    : 0

  const chartData = formatChartData.categories(data)

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
            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
            Category Performance
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Revenue distribution by product category
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Total Categories</p>
              <p className="text-2xl font-bold text-purple-600">
                {data.length}
              </p>
            </div>
          </div>
        </div>
        
        {topCategory && (
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Top Category</p>
                <p className="text-lg font-bold text-green-600">
                  {topCategory._id}
                </p>
                <p className="text-xs text-green-700">
                  {topCategoryPercentage}% of total revenue
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-80">
        {data.length > 0 ? (
          <Pie data={chartData} options={categoryChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Category Data</p>
              <p className="text-sm">No category sales data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Category List */}
      {data.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Category Breakdown</h4>
          <div className="space-y-3">
            {data.map((category, index) => {
              const percentage = totalRevenue > 0 
                ? ((category.revenue / totalRevenue) * 100).toFixed(1)
                : 0
              
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ 
                        backgroundColor: chartData.datasets[0].backgroundColor[index] 
                      }}
                    ></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {category._id || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {category.quantity?.toLocaleString() || 0} items sold
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(category.revenue)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {percentage}%
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Performance Insights */}
      {data.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Insights</h4>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-900">Category Performance</p>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  {topCategory && (
                    <li>
                      • <strong>{topCategory._id}</strong> is your top-performing category with {formatCurrency(topCategory.revenue)} in revenue
                    </li>
                  )}
                  {data.length >= 3 && (
                    <li>
                      • Top 3 categories account for {
                        ((data.slice(0, 3).reduce((sum, cat) => sum + cat.revenue, 0) / totalRevenue) * 100).toFixed(1)
                      }% of total revenue
                    </li>
                  )}
                  {data.length > 5 && (
                    <li>
                      • You have {data.length} active product categories
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

export default CategoryChart
