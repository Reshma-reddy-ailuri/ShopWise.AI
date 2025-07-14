import React, { useState, useEffect } from 'react'
import { X, Tag, Truck, Gift, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FloatingNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const sampleNotifications = [
    {
      id: 1,
      type: 'deal',
      icon: <Tag className="w-4 h-4" />,
      title: 'Flash Sale!',
      message: '50% off Electronics - Limited time only',
      color: 'bg-red-500',
      delay: 5000
    },
    {
      id: 2,
      type: 'shipping',
      icon: <Truck className="w-4 h-4" />,
      title: 'Free Shipping',
      message: 'Free shipping on orders over $35',
      color: 'bg-green-500',
      delay: 10000
    },
    {
      id: 3,
      type: 'reward',
      icon: <Gift className="w-4 h-4" />,
      title: 'Reward Points',
      message: 'Earn 2x points on your next purchase',
      color: 'bg-purple-500',
      delay: 15000
    },
    {
      id: 4,
      type: 'ai',
      icon: <Zap className="w-4 h-4" />,
      title: 'AI Recommendation',
      message: 'New products added based on your interests',
      color: 'bg-blue-500',
      delay: 20000
    }
  ]

  useEffect(() => {
    // Show notifications with delays
    sampleNotifications.forEach((notification) => {
      setTimeout(() => {
        setNotifications(prev => [...prev, notification])
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
          removeNotification(notification.id)
        }, 5000)
      }, notification.delay)
    })
  }, [])

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  return (
    <div className="fixed top-20 right-6 z-40 space-y-3 max-w-sm">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 relative overflow-hidden"
          >
            {/* Color accent */}
            <div className={`absolute top-0 left-0 w-1 h-full ${notification.color}`}></div>
            
            {/* Content */}
            <div className="flex items-start space-x-3 ml-2">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${notification.color}`}>
                {notification.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm">{notification.title}</h4>
                <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              className={`absolute bottom-0 left-0 h-1 ${notification.color}`}
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default FloatingNotifications
