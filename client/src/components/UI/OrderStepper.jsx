import React from 'react'
import { Check, Package, Truck, MapPin, Clock, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

const OrderStepper = ({ 
  currentStatus, 
  orderDate, 
  statusHistory = [], 
  estimatedDelivery,
  className = '',
  size = 'default' // 'compact' | 'default' | 'large'
}) => {
  // Define order steps with their details
  const steps = [
    {
      key: 'pending',
      label: 'Order Placed',
      description: 'Your order has been received',
      icon: Clock,
      color: 'blue'
    },
    {
      key: 'confirmed',
      label: 'Confirmed',
      description: 'Order confirmed and being prepared',
      icon: Check,
      color: 'green'
    },
    {
      key: 'processing',
      label: 'Processing',
      description: 'Items are being prepared',
      icon: Package,
      color: 'yellow'
    },
    {
      key: 'packed',
      label: 'Packed',
      description: 'Items packed and ready to ship',
      icon: Package,
      color: 'purple'
    },
    {
      key: 'shipped',
      label: 'Shipped',
      description: 'Package is on its way',
      icon: Truck,
      color: 'blue'
    },
    {
      key: 'delivered',
      label: 'Delivered',
      description: 'Package has been delivered',
      icon: MapPin,
      color: 'green'
    }
  ]

  // Handle cancelled/returned orders
  const isCancelled = currentStatus === 'cancelled'
  const isReturned = currentStatus === 'returned'
  
  if (isCancelled || isReturned) {
    const cancelledSteps = [
      {
        key: 'pending',
        label: 'Order Placed',
        description: 'Your order was received',
        icon: Check,
        color: 'green'
      },
      {
        key: isCancelled ? 'cancelled' : 'returned',
        label: isCancelled ? 'Cancelled' : 'Returned',
        description: isCancelled ? 'Order has been cancelled' : 'Order has been returned',
        icon: AlertCircle,
        color: 'red'
      }
    ]
    
    return (
      <div className={`${className}`}>
        <div className="flex items-center justify-between">
          {cancelledSteps.map((step, index) => (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step.color === 'red' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm font-medium text-gray-900">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
              {index < cancelledSteps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-300 mx-4"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Find current step index
  const currentStepIndex = steps.findIndex(step => step.key === currentStatus)
  const validCurrentIndex = currentStepIndex >= 0 ? currentStepIndex : 0

  // Get status timestamp from history
  const getStatusTimestamp = (status) => {
    const historyItem = statusHistory.find(item => item.status === status)
    return historyItem?.timestamp || (status === 'pending' ? orderDate : null)
  }

  // Size variants
  const sizeClasses = {
    compact: {
      container: 'py-4',
      circle: 'w-8 h-8',
      icon: 'w-4 h-4',
      label: 'text-xs',
      description: 'text-xs',
      line: 'h-0.5'
    },
    default: {
      container: 'py-6',
      circle: 'w-10 h-10',
      icon: 'w-5 h-5',
      label: 'text-sm',
      description: 'text-xs',
      line: 'h-0.5'
    },
    large: {
      container: 'py-8',
      circle: 'w-12 h-12',
      icon: 'w-6 h-6',
      label: 'text-base',
      description: 'text-sm',
      line: 'h-1'
    }
  }

  const sizes = sizeClasses[size]

  return (
    <div className={`${sizes.container} ${className}`}>
      {/* Progress Header */}
      {size !== 'compact' && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Order Progress</h3>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Ordered: {new Date(orderDate).toLocaleDateString()}</span>
            {estimatedDelivery && currentStatus !== 'delivered' && (
              <span>Est. Delivery: {new Date(estimatedDelivery).toLocaleDateString()}</span>
            )}
          </div>
        </div>
      )}

      {/* Stepper */}
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-5 left-5 right-5 flex">
          <div className={`flex-1 ${sizes.line} bg-gray-200 rounded-full`}></div>
        </div>

        {/* Active Progress Line */}
        <div className="absolute top-5 left-5 right-5 flex">
          <motion.div
            className={`${sizes.line} bg-blue-500 rounded-full`}
            initial={{ width: '0%' }}
            animate={{ 
              width: validCurrentIndex === 0 ? '0%' : `${(validCurrentIndex / (steps.length - 1)) * 100}%` 
            }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < validCurrentIndex
            const isCurrent = index === validCurrentIndex
            const isPending = index > validCurrentIndex
            const timestamp = getStatusTimestamp(step.key)

            return (
              <motion.div
                key={step.key}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Circle */}
                <motion.div
                  className={`${sizes.circle} rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isCurrent
                      ? 'bg-blue-500 border-blue-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  animate={isCurrent ? { 
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0.4)',
                      '0 0 0 10px rgba(59, 130, 246, 0)',
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: isCurrent ? Infinity : 0 }}
                >
                  {isCompleted ? (
                    <Check className={sizes.icon} />
                  ) : (
                    <step.icon className={sizes.icon} />
                  )}
                </motion.div>

                {/* Step Label */}
                <div className="text-center mt-3 max-w-24">
                  <p className={`${sizes.label} font-medium ${
                    isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </p>
                  
                  {size !== 'compact' && (
                    <p className={`${sizes.description} text-gray-500 mt-1`}>
                      {step.description}
                    </p>
                  )}

                  {/* Timestamp */}
                  {timestamp && (isCompleted || isCurrent) && size !== 'compact' && (
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Current Status Info */}
      {size !== 'compact' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              {React.createElement(steps[validCurrentIndex]?.icon || Clock, { 
                className: "w-4 h-4 text-white" 
              })}
            </div>
            <div>
              <p className="font-medium text-blue-900">
                {steps[validCurrentIndex]?.label || 'Processing'}
              </p>
              <p className="text-sm text-blue-700">
                {steps[validCurrentIndex]?.description || 'Your order is being processed'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderStepper
