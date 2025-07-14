import React from 'react'
import { Line } from 'react-chartjs-2'
import { revenueChartOptions, formatChartData } from '../../utils/chartConfig'
import { TrendingUp, DollarSign, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../../context/LanguageContext'

const RevenueChart = ({ 
  data = [], 
  period = '12months',
  isLoading = false,
  className = '' 
}) => {
  const { t } = useTranslation()
  const { formatCurrency } = useLanguage()

  // Calculate summary statistics
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
  const totalOrders = data.reduce((sum, item) => sum + item.orders, 0)
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0
  
  // Calculate growth rate (comparing last two periods)
  const growthRate = data.length >= 2 
    ? ((data[data.length - 1].revenue - data[data.length - 2].revenue) / data[data.length - 2].revenue) * 100
    : 0

  const chartData = formatChartData.revenue(data)

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-soft p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
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
            <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
            Revenue Analytics
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Revenue trends over the selected period
          </p>
        </div>
        
        {/* Period indicator */}
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-4 h-4 mr-1" />
          {period === '7days' && 'Last 7 Days'}
          {period === '30days' && 'Last 30 Days'}
          {period === '3months' && 'Last 3 Months'}
          {period === '6months' && 'Last 6 Months'}
          {period === '12months' && 'Last 12 Months'}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Growth Rate</p>
              <p className="text-2xl font-bold text-green-600">
                {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-purple-900">Avg Order Value</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(avgOrderValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        {data.length > 0 ? (
          <Line data={chartData} options={revenueChartOptions} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium">No Revenue Data</p>
              <p className="text-sm">No revenue data available for the selected period</p>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {data.length > 0 && (
        <div className="mt-6 border-t border-gray-200 pt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.slice(-5).map((item, index) => {
                  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                  const periodLabel = `${months[item._id.month - 1]} ${item._id.year}`
                  const avgOrder = item.orders > 0 ? item.revenue / item.orders : 0
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {periodLabel}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.revenue)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {item.orders.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(avgOrder)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default RevenueChart
