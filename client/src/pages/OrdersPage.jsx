import React, { useState } from 'react'
import { useQuery } from 'react-query'
import { Package, Search, Filter, Calendar } from 'lucide-react'
import { ordersAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from '../components/UI/LoadingSpinner'
import OrderCard from '../components/UI/OrderCard'

const OrdersPage = () => {
  const { user } = useAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('all')

  // Fetch orders
  const { data: ordersData, isLoading, error } = useQuery(
    ['orders', currentPage, statusFilter, searchQuery, dateFilter],
    () => ordersAPI.getOrders({
      page: currentPage,
      limit: 10,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined,
      dateRange: dateFilter !== 'all' ? dateFilter : undefined
    }),
    {
      enabled: !!user,
      keepPreviousData: true,
    }
  )

  const orders = ordersData?.data?.orders || []
  const pagination = ordersData?.data?.pagination || {}

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'packed', label: 'Packed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' }
  ]

  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last3months', label: 'Last 3 Months' },
    { value: 'lastyear', label: 'Last Year' }
  ]

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleDateFilter = (date) => {
    setDateFilter(date)
    setCurrentPage(1)
  }

  const handleSearch = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  if (!user) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to view your orders.</p>
        </div>
      </div>
    )
  }

  // TODO: Add the main component return statement here
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>
      <p className="text-gray-600">Order management functionality coming soon...</p>
    </div>
  )
}

export default OrdersPage
