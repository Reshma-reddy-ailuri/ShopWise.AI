import React, { useState, useRef } from 'react'
import { 
  MessageCircle, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Camera, 
  Image as ImageIcon,
  Sparkles,
  ShoppingBag
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hi! I'm your AI shopping assistant. I can help you find products, compare prices, and make recommendations. You can type, speak, or even upload images!",
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)

  // Show onboarding after 3 seconds for first-time users
  React.useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('shopwise-assistant-seen')
    if (!hasSeenOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleOnboardingComplete = () => {
    setShowOnboarding(false)
    localStorage.setItem('shopwise-assistant-seen', 'true')
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle text message send
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    // Simulate AI response (replace with actual AI API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      }])
      setIsLoading(false)
    }, 1000)
  }

  // Generate AI response (placeholder - replace with actual AI integration)
  const generateAIResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    if (input.includes('recommend') || input.includes('suggest')) {
      return "Based on your preferences, I'd recommend checking out our featured electronics section. We have great deals on smartphones, laptops, and smart home devices. Would you like me to show you specific products?"
    }
    
    if (input.includes('price') || input.includes('cost') || input.includes('cheap')) {
      return "I can help you find the best deals! Our current promotions include up to 50% off electronics and free shipping on orders over $35. What type of product are you looking for?"
    }
    
    if (input.includes('delivery') || input.includes('shipping')) {
      return "We offer free standard shipping on orders over $35, with delivery typically within 3-5 business days. For faster delivery, we have express shipping options available. What would you like to order?"
    }
    
    return "I understand you're looking for help with shopping. I can assist you with product recommendations, price comparisons, order tracking, and more. What specific product or service can I help you find today?"
  }

  // Handle voice input (placeholder)
  const handleVoiceInput = () => {
    if (!isListening) {
      setIsListening(true)
      toast.success('Voice input activated! Start speaking...')
      
      // Simulate voice recognition (replace with actual speech recognition)
      setTimeout(() => {
        setIsListening(false)
        setInputMessage("I'm looking for a new smartphone under $500")
        toast.success('Voice input captured!')
      }, 3000)
    } else {
      setIsListening(false)
      toast.info('Voice input stopped')
    }
  }

  // Handle image upload
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageMessage = {
          id: Date.now(),
          type: 'user',
          content: 'I uploaded an image for product search',
          image: e.target.result,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, imageMessage])
        
        // Simulate AI image analysis
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'ai',
            content: "I can see you've uploaded an image! Based on what I can analyze, this looks like an electronic device. I found similar products in our catalog. Would you like me to show you matching items with prices and reviews?",
            timestamp: new Date()
          }])
        }, 1500)
      }
      reader.readAsDataURL(file)
    }
  }

  // Sample product recommendations
  const sampleRecommendations = [
    { name: "iPhone 15 Pro", price: "$999", rating: 4.8 },
    { name: "Samsung Galaxy S24", price: "$799", rating: 4.7 },
    { name: "MacBook Air M3", price: "$1,199", rating: 4.9 }
  ]

  return (
    <>
      {/* ShopWise Assistant Button */}
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${isOpen ? 'hidden' : 'block'}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5, type: "spring" }}
      >
        {/* Floating Button */}
        <motion.button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 4px 20px rgba(59, 130, 246, 0.3)",
              "0 4px 30px rgba(147, 51, 234, 0.4)",
              "0 4px 20px rgba(59, 130, 246, 0.3)"
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          {/* Button Content */}
          <div className="flex items-center px-6 py-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            >
              <Sparkles className="w-6 h-6 mr-3" />
            </motion.div>
            <div className="text-left">
              <div className="font-bold text-sm">ShopWise</div>
              <div className="text-xs opacity-90">AI Assistant</div>
            </div>
          </div>

          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white opacity-20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0, 0.2]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        </motion.button>

        {/* Tooltip */}
        <motion.div
          className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap"
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ opacity: 1, y: 0 }}
        >
          Ask me anything! 💬
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </motion.div>

        {/* Notification Badge */}
        <motion.div
          className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          AI
        </motion.div>
      </motion.div>

      {/* Quick Actions Mini Button */}
      <motion.div
        className={`fixed bottom-6 right-32 z-40 ${isOpen ? 'hidden' : 'block'}`}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 2, duration: 0.3 }}
      >
        <motion.button
          onClick={() => {
            setMessages(prev => [...prev, {
              id: Date.now(),
              type: 'user',
              content: 'Show me today\'s deals',
              timestamp: new Date()
            }])
            setIsOpen(true)
          }}
          className="bg-white text-walmart-blue border-2 border-walmart-blue rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 group"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.9 }}
        >
          <ShoppingBag className="w-5 h-5" />

          {/* Mini Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            Quick Deals
          </div>
        </motion.button>
      </motion.div>

      {/* AI Assistant Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-6 right-6 z-50 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold">AI Shopping Assistant</h3>
                  <p className="text-xs opacity-90">Online • Ready to help</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-1 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {message.image && (
                      <img
                        src={message.image}
                        alt="Uploaded"
                        className="w-full h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-gray-200">
              <div className="flex flex-wrap gap-2 mb-2">
                <button className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors">
                  Find deals
                </button>
                <button className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded-full hover:bg-green-100 transition-colors">
                  Track order
                </button>
                <button className="text-xs bg-purple-50 text-purple-600 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
                  Recommendations
                </button>
                <button className="text-xs bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600 px-3 py-1 rounded-full hover:from-purple-100 hover:to-blue-100 transition-colors">
                  Virtual Try-On
                </button>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                {/* Voice input button */}
                <button
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-full transition-colors ${
                    isListening 
                      ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Image upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                {/* Send button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative"
            >
              {/* Close button */}
              <button
                onClick={handleOnboardingComplete}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Content */}
              <div className="mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Meet Your ShopWise Assistant! 🎉
                </h3>
                <p className="text-gray-600 mb-6">
                  I'm here to help you find the perfect products, get deals, and answer any shopping questions!
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-2xl mb-1">💬</div>
                    <div className="font-medium">Chat with me</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-2xl mb-1">🎤</div>
                    <div className="font-medium">Voice commands</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-2xl mb-1">📸</div>
                    <div className="font-medium">Image search</div>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-2xl mb-1">✨</div>
                    <div className="font-medium">Virtual try-on</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    handleOnboardingComplete()
                    setIsOpen(true)
                  }}
                  className="w-full btn btn-primary"
                >
                  Start Chatting
                </button>
                <button
                  onClick={handleOnboardingComplete}
                  className="w-full btn btn-outline"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default AIAssistant
