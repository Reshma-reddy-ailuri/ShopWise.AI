import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Calendar, Download, RefreshCw, BarChart3 } from 'lucide-react'
import { analyticsAPI } from '../../utils/api'
import { useTranslation } from 'react-i18next'
import RevenueChart from '../Charts/RevenueChart'
import CategoryChart from '../Charts/CategoryChart'
import ProductsChart from '../Charts/ProductsChart'
import LoadingSpinner from '../UI/LoadingSpinner'

const AnalyticsDashboard = () => {
  const { t } = useTranslation()
  const [selectedPeriod, setSelectedPeriod] = useState('12months')

  // Fetch analytics data
  const { 
    data: analyticsData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery(
    ['analytics-dashboard', selectedPeriod],
    () => analyticsAPI.getDashboard({ period: selectedPeriod }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  )

  const analytics = analyticsData?.data || {}
  const { revenue, categories, topProducts, summary } = analytics

  // Period options
  const periodOptions = [
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: '6months', label: 'Last 6 Months' },
    { value: '12months', label: 'Last 12 Months' }
  ]

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period)
  }

  const handleRefresh = () => {
    refetch()
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Exporting analytics data...')
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-8 text-center">
        <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-600 mb-4">
          There was an error loading the analytics data. Please try again.
        </p>
        <button
          onClick={handleRefresh}
          className="btn btn-primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
            <p className="text-gray-600">
              Comprehensive insights into your store's performance
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            {/* Period Selector */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn btn-outline btn-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              
              <button
                onClick={handleExport}
                className="btn btn-primary btn-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalOrders?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${summary.avgOrderValue?.toFixed(2) || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-soft p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.totalCategories || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2">
          <RevenueChart
            data={revenue?.monthly || []}
            period={selectedPeriod}
            isLoading={isLoading}
          />
        </div>
        
        {/* Category Chart */}
        <CategoryChart
          data={categories || []}
          isLoading={isLoading}
        />
        
        {/* Products Chart */}
        <ProductsChart
          data={topProducts || []}
          isLoading={isLoading}
        />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <LoadingSpinner size="md" />
            <span className="text-gray-900">Loading analytics data...</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AnalyticsDashboard
