import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Search, 
  Camera, 
  Mic, 
  MicOff, 
  Upload,
  X,
  Sparkles
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const AISearchBar = ({ className = '', isMobile = false }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Voice search functionality
  const startVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Voice search not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      toast.success('Listening... Speak now!')
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setSearchQuery(transcript)
      setIsListening(false)
      toast.success(`Heard: "${transcript}"`)
      
      // Auto-search after voice input
      setTimeout(() => {
        handleSearch(null, transcript)
      }, 500)
    }

    recognition.onerror = (event) => {
      setIsListening(false)
      toast.error('Voice search error: ' + event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  // Image search functionality
  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    setIsProcessing(true)
    
    // Simulate AI image processing
    setTimeout(() => {
      const mockSearchTerms = [
        'blue denim jacket',
        'wireless headphones',
        'running shoes',
        'smartphone case',
        'coffee mug',
        'laptop bag'
      ]
      
      const randomTerm = mockSearchTerms[Math.floor(Math.random() * mockSearchTerms.length)]
      setSearchQuery(randomTerm)
      setIsProcessing(false)
      setShowImageUpload(false)
      
      toast.success(`Found: ${randomTerm}`)
      
      // Auto-search with detected item
      setTimeout(() => {
        handleSearch(null, randomTerm)
      }, 500)
    }, 2000)
  }

  // Handle search submission
  const handleSearch = (e, query = null) => {
    if (e) e.preventDefault()
    
    const searchTerm = query || searchQuery.trim()
    if (searchTerm) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`)
      setSearchQuery('')
      setShowImageUpload(false)
    }
  }

  // AI suggestions (mock data)
  const aiSuggestions = [
    '🔥 Trending: Wireless earbuds',
    '💡 Smart home devices',
    '👕 Fashion deals',
    '📱 Latest smartphones'
  ]

  return (
    <div className={`relative ${className}`}>
      {/* Main search form */}
      <form onSubmit={handleSearch} className="flex w-full">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isMobile ? "Search with AI..." : "Search everything with AI assistance..."}
            className={`w-full px-4 py-3 pr-12 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-walmart-blue focus:border-walmart-blue ${
              isMobile ? 'text-sm' : ''
            }`}
          />
          
          {/* AI indicator */}
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Sparkles className="w-4 h-4 text-walmart-blue animate-pulse" />
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          disabled={isProcessing}
          className="bg-walmart-yellow hover:bg-yellow-500 px-4 py-3 transition-colors duration-200 disabled:opacity-50"
        >
          <Search className="w-5 h-5 text-gray-700" />
        </button>

        {/* Voice search button */}
        <button
          type="button"
          onClick={startVoiceSearch}
          disabled={isProcessing}
          className={`px-4 py-3 transition-colors duration-200 disabled:opacity-50 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
          title="Voice Search"
        >
          {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        {/* Image search button */}
        <button
          type="button"
          onClick={() => setShowImageUpload(!showImageUpload)}
          disabled={isProcessing}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-r-lg transition-colors duration-200 disabled:opacity-50"
          title="Image Search"
        >
          <Camera className="w-5 h-5" />
        </button>
      </form>

      {/* Image upload modal */}
      {showImageUpload && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-gray-900">Upload Image to Search</h3>
            <button
              onClick={() => setShowImageUpload(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-walmart-blue mb-2"></div>
                <p className="text-sm text-gray-600">AI is analyzing your image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Drag & drop an image or click to browse
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-walmart-blue text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Choose Image
                </button>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500 mt-2">
            Our AI will identify products in your image and find similar items
          </p>
        </div>
      )}

      {/* AI suggestions */}
      {!isMobile && searchQuery === '' && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-40">
          <div className="text-xs text-gray-500 mb-2">AI Suggestions:</div>
          <div className="space-y-1">
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  const cleanSuggestion = suggestion.replace(/^[🔥💡👕📱]\s*/, '').replace(/^[A-Za-z]+:\s*/, '')
                  setSearchQuery(cleanSuggestion)
                  handleSearch(null, cleanSuggestion)
                }}
                className="block w-full text-left text-sm text-gray-700 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Voice search indicator */}
      {isListening && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-red-50 border border-red-200 rounded-lg p-3 z-50">
          <div className="flex items-center">
            <div className="animate-pulse bg-red-500 rounded-full w-3 h-3 mr-2"></div>
            <span className="text-red-700 text-sm font-medium">Listening... Speak now!</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default AISearchBar
