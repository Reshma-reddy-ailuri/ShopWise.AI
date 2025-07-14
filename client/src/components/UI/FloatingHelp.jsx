import React, { useState } from 'react'
import { HelpCircle, X, Lightbulb, MessageCircle, Search, ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FloatingHelp = () => {
  const [isOpen, setIsOpen] = useState(false)

  const helpTips = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "AI Assistant",
      description: "Click the ShopWise Assistant button to get personalized help and recommendations",
      action: "Try it now"
    },
    {
      icon: <Search className="w-5 h-5" />,
      title: "Smart Search",
      description: "Use the search bar to find products by name, brand, or description",
      action: "Search products"
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      title: "Easy Shopping",
      description: "Add items to cart and checkout securely with multiple payment options",
      action: "View cart"
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: "Virtual Try-On",
      description: "Try on clothes and accessories virtually using AI technology",
      action: "Browse clothing"
    }
  ]

  return (
    <>
      {/* Help Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 z-50 bg-white text-gray-600 border-2 border-gray-200 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-500 hover:text-blue-600 ${isOpen ? 'hidden' : 'block'}`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.3 }}
      >
        <HelpCircle className="w-5 h-5" />
      </motion.button>

      {/* Help Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -20 }}
            className="fixed bottom-6 left-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Quick Help</h3>
                  <p className="text-xs text-gray-500">Tips to get started</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {helpTips.map((tip, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                    {tip.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{tip.description}</p>
                    <button className="text-xs text-blue-600 hover:text-blue-700 mt-2 font-medium">
                      {tip.action} →
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Contact Support */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-3">Need more help?</p>
                  <div className="flex space-x-2">
                    <button className="flex-1 text-xs bg-blue-50 text-blue-600 py-2 px-3 rounded-lg hover:bg-blue-100 transition-colors">
                      Contact Support
                    </button>
                    <button className="flex-1 text-xs bg-gray-50 text-gray-600 py-2 px-3 rounded-lg hover:bg-gray-100 transition-colors">
                      View FAQ
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default FloatingHelp
