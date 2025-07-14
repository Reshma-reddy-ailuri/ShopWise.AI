import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  X,
  Heart,
  MapPin,
  ChevronDown,
  AlertTriangle
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useLanguage } from '../../context/LanguageContext'
import { formatCurrency, storage } from '../../utils/helpers'
import LanguageSwitcher from '../UI/LanguageSwitcher'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [budgetLimit, setBudgetLimit] = useState(0)

  const { user, isAuthenticated, logout } = useAuth()
  const { itemCount, total } = useCart()
  const { formatCurrency: formatLocalizedCurrency } = useLanguage()
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Load budget limit from storage
  useEffect(() => {
    const savedBudget = storage.get('user-budget-limit', 0)
    setBudgetLimit(savedBudget)
  }, [])

  // Check if budget is exceeded or close to limit
  const isBudgetExceeded = budgetLimit > 0 && total > budgetLimit
  const isNearBudgetLimit = budgetLimit > 0 && total > budgetLimit * 0.8 && !isBudgetExceeded

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const handleLogout = () => {
    logout()
    setIsUserMenuOpen(false)
    navigate('/')
  }

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Sports & Outdoors',
    'Health & Beauty',
    'Toys & Games',
    'Books',
    'Automotive',
    'Grocery'
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      {/* Top bar */}
      <div className="bg-walmart-blue text-white py-2">
        <div className="container">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Deliver to 90210</span>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/track-order" className="hover:underline">Track Your Order</Link>
              <Link to="/help" className="hover:underline">Help</Link>
              <span>Free shipping on orders $35+</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-walmart-blue text-white px-3 py-2 rounded-lg font-bold text-xl">
              SW
            </div>
            <div>
              <div className="font-bold text-xl text-gray-900">ShopWise</div>
              <div className="text-xs text-walmart-blue font-medium">AI Shopping</div>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search everything at ShopWise..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue"
              />
              <button
                type="submit"
                className="bg-walmart-yellow hover:bg-yellow-500 px-6 py-3 rounded-r-lg transition-colors duration-200"
              >
                <Search className="w-5 h-5 text-gray-700" />
              </button>
            </form>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Favorites (hidden on mobile) */}
            <button className="hidden lg:flex items-center space-x-1 text-gray-600 hover:text-walmart-blue transition-colors">
              <Heart className="w-5 h-5" />
              <span className="text-sm">Favorites</span>
            </button>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-1 text-gray-600 hover:text-walmart-blue transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block text-sm">
                  {isAuthenticated ? `Hi, ${user?.firstName}` : 'Sign In'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* User dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {isAuthenticated ? (
                    <>
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('navigation.profile')}
                      </Link>
                      <Link
                        to="/orders"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('navigation.orders')}
                      </Link>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        {t('navigation.logout')}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('navigation.login')}
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        {t('navigation.register')}
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <LanguageSwitcher variant="compact" />

            {/* Cart */}
            <Link
              to="/cart"
              className="relative flex items-center space-x-1 text-gray-600 hover:text-walmart-blue transition-colors"
            >
              <div className="relative">
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-walmart-yellow text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </div>
              <div className="hidden md:block">
                <div className="text-xs text-gray-500">{t('navigation.cart')}</div>
                <div className="text-sm font-medium">
                  {total > 0 ? formatLocalizedCurrency(total) : formatLocalizedCurrency(0)}
                </div>
              </div>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-gray-600 hover:text-walmart-blue"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('header.searchPlaceholder')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-walmart-blue"
            />
            <button
              type="submit"
              className="bg-walmart-yellow hover:bg-yellow-500 px-4 py-2 rounded-r-lg"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>
          </form>
        </div>
      </div>

      {/* Categories navigation */}
      <div className="hidden lg:block bg-gray-50 border-t border-gray-200">
        <div className="container">
          <nav className="flex items-center space-x-8 py-3">
            <Link
              to="/products"
              className="text-sm font-medium text-gray-700 hover:text-walmart-blue transition-colors"
            >
              All Departments
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="text-sm text-gray-600 hover:text-walmart-blue transition-colors whitespace-nowrap"
              >
                {category}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="py-4 space-y-2">
            <Link
              to="/products"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              All Products
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${encodeURIComponent(category)}`}
                className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
                onClick={() => setIsMenuOpen(false)}
              >
                {category}
              </Link>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            <Link
              to="/help"
              className="block px-4 py-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(false)}
            >
              Help & Support
            </Link>
          </div>
        </div>
      )}

      {/* Budget Warning Banner */}
      {(isBudgetExceeded || isNearBudgetLimit) && (
        <div className={`${
          isBudgetExceeded ? 'bg-red-100 border-red-200 text-red-800' : 'bg-yellow-100 border-yellow-200 text-yellow-800'
        } border-b px-4 py-2`}>
          <div className="container">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {isBudgetExceeded ? (
                    t('header.budgetExceeded', {
                      total: formatLocalizedCurrency(total),
                      limit: formatLocalizedCurrency(budgetLimit),
                      overage: formatLocalizedCurrency(total - budgetLimit)
                    })
                  ) : (
                    t('header.budgetAlert', {
                      total: formatLocalizedCurrency(total),
                      limit: formatLocalizedCurrency(budgetLimit),
                      percentage: Math.round((total / budgetLimit) * 100)
                    })
                  )}
                </span>
              </div>
              <Link
                to="/cart"
                className="text-sm font-medium hover:underline"
              >
                {t('header.reviewCart')} →
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
