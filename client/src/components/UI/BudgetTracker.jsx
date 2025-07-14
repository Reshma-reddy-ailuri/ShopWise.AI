import React, { useState, useEffect } from 'react'
import { DollarSign, AlertTriangle, CheckCircle, TrendingUp, Target } from 'lucide-react'
import { formatCurrency, storage } from '../../utils/helpers'
import { motion, AnimatePresence } from 'framer-motion'

const BudgetTracker = ({ 
  currentTotal, 
  onBudgetChange, 
  showInput = true, 
  compact = false,
  className = '' 
}) => {
  const [budgetLimit, setBudgetLimit] = useState(() => {
    return storage.get('user-budget-limit', 0)
  })
  const [showBudgetInput, setShowBudgetInput] = useState(false)
  const [tempBudgetValue, setTempBudgetValue] = useState('')

  // Budget calculations
  const isBudgetExceeded = budgetLimit > 0 && currentTotal > budgetLimit
  const budgetRemaining = budgetLimit > 0 ? budgetLimit - currentTotal : 0
  const budgetUsedPercentage = budgetLimit > 0 ? (currentTotal / budgetLimit) * 100 : 0

  // Save budget to localStorage and notify parent
  useEffect(() => {
    if (budgetLimit > 0) {
      storage.set('user-budget-limit', budgetLimit)
      onBudgetChange?.(budgetLimit)
    }
  }, [budgetLimit, onBudgetChange])

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
    storage.remove('user-budget-limit')
    onBudgetChange?.(0)
  }

  const getBudgetStatus = () => {
    if (budgetLimit === 0) return { status: 'none', color: 'gray', icon: Target }
    if (isBudgetExceeded) return { status: 'exceeded', color: 'red', icon: AlertTriangle }
    if (budgetUsedPercentage > 80) return { status: 'warning', color: 'yellow', icon: TrendingUp }
    return { status: 'good', color: 'green', icon: CheckCircle }
  }

  const { status, color, icon: StatusIcon } = getBudgetStatus()

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <StatusIcon className={`w-4 h-4 text-${color}-500`} />
        <span className="text-sm text-gray-600">
          {budgetLimit > 0 ? (
            <>
              {formatCurrency(currentTotal)} / {formatCurrency(budgetLimit)}
              {isBudgetExceeded && (
                <span className="text-red-600 ml-1">
                  (+{formatCurrency(currentTotal - budgetLimit)})
                </span>
              )}
            </>
          ) : (
            'No budget set'
          )}
        </span>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-gray-900 flex items-center">
          <DollarSign className="w-4 h-4 mr-2" />
          Budget Tracker
        </h3>
        {budgetLimit > 0 && (
          <button
            onClick={handleRemoveBudget}
            className="text-xs text-red-600 hover:text-red-700 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {budgetLimit > 0 ? (
        <div className="space-y-3">
          {/* Budget Status Alert */}
          <AnimatePresence>
            {isBudgetExceeded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Budget Exceeded!</span>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  You're {formatCurrency(currentTotal - budgetLimit)} over your budget limit.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Budget Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Budget Limit:</span>
              <span className="font-medium">{formatCurrency(budgetLimit)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Current Total:</span>
              <span className={`font-medium ${isBudgetExceeded ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(currentTotal)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {isBudgetExceeded ? 'Over Budget:' : 'Remaining:'}
              </span>
              <span className={`font-medium ${isBudgetExceeded ? 'text-red-600' : 'text-green-600'}`}>
                {isBudgetExceeded ? '+' : ''}{formatCurrency(Math.abs(budgetRemaining))}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isBudgetExceeded ? 'bg-red-500' : 
                  budgetUsedPercentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(budgetUsedPercentage, 100)}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span className={budgetUsedPercentage > 100 ? 'text-red-600 font-medium' : ''}>
                {budgetUsedPercentage.toFixed(0)}%
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Update Budget Button */}
          {showInput && (
            <button
              onClick={() => setShowBudgetInput(true)}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Update Budget
            </button>
          )}
        </div>
      ) : (
        <div>
          {!showBudgetInput ? (
            showInput && (
              <button
                onClick={() => setShowBudgetInput(true)}
                className="w-full text-sm bg-blue-50 text-blue-600 py-3 px-4 rounded-lg border-2 border-dashed border-blue-300 hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Target className="w-4 h-4" />
                <span>Set Budget Limit</span>
              </button>
            )
          ) : (
            <div className="space-y-3">
              <input
                type="number"
                value={tempBudgetValue}
                onChange={(e) => setTempBudgetValue(e.target.value)}
                placeholder="Enter budget amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSetBudget}
                  disabled={!tempBudgetValue || parseFloat(tempBudgetValue) <= 0}
                  className="flex-1 text-sm bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Set Budget
                </button>
                <button
                  onClick={() => {
                    setShowBudgetInput(false)
                    setTempBudgetValue('')
                  }}
                  className="flex-1 text-sm bg-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BudgetTracker
