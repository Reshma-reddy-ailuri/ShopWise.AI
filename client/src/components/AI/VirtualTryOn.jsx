import React, { useState, useRef } from 'react'
import { Camera, Upload, X, RotateCcw, Download, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

const VirtualTryOn = ({ product, isOpen, onClose }) => {
  const [step, setStep] = useState('upload') // upload, processing, result
  const [uploadedImage, setUploadedImage] = useState(null)
  const [processedImage, setProcessedImage] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [useCamera, setUseCamera] = useState(false)
  const fileInputRef = useRef(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  // Check if product is suitable for virtual try-on
  const isTryOnCompatible = () => {
    const compatibleCategories = ['Clothing', 'Accessories', 'Shoes', 'Jewelry', 'Eyewear']
    const compatibleKeywords = ['shirt', 'dress', 'jacket', 'shoes', 'glasses', 'hat', 'watch', 'necklace']
    
    return compatibleCategories.includes(product?.category) || 
           compatibleKeywords.some(keyword => 
             product?.name?.toLowerCase().includes(keyword) ||
             product?.description?.toLowerCase().includes(keyword)
           )
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('Image size should be less than 10MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target.result)
        setStep('processing')
        processVirtualTryOn(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setUseCamera(true)
      }
    } catch (error) {
      toast.error('Camera access denied or not available')
      console.error('Camera error:', error)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      const context = canvas.getContext('2d')
      
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      context.drawImage(video, 0, 0)
      
      const imageData = canvas.toDataURL('image/jpeg')
      setUploadedImage(imageData)
      setUseCamera(false)
      
      // Stop camera stream
      const stream = video.srcObject
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      
      setStep('processing')
      processVirtualTryOn(imageData)
    }
  }

  const processVirtualTryOn = async (imageData) => {
    setIsProcessing(true)
    
    // Simulate AI processing (replace with actual AI service)
    try {
      // This would typically call an AI service like:
      // - Google's Virtual Try-On API
      // - Amazon's AR View
      // - Custom ML model
      
      await new Promise(resolve => setTimeout(resolve, 3000)) // Simulate processing time
      
      // For demo, we'll create a mock result
      const mockResult = await createMockTryOnResult(imageData)
      setProcessedImage(mockResult)
      setStep('result')
      toast.success('Virtual try-on complete!')
      
    } catch (error) {
      toast.error('Virtual try-on failed. Please try again.')
      setStep('upload')
    } finally {
      setIsProcessing(false)
    }
  }

  const createMockTryOnResult = async (originalImage) => {
    // Create a mock "try-on" result by overlaying product info
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw original image
        ctx.drawImage(img, 0, 0)
        
        // Add overlay text (mock try-on effect)
        ctx.fillStyle = 'rgba(0, 76, 145, 0.8)'
        ctx.fillRect(10, 10, 300, 100)
        
        ctx.fillStyle = 'white'
        ctx.font = 'bold 16px Arial'
        ctx.fillText('Virtual Try-On Result', 20, 35)
        ctx.font = '14px Arial'
        ctx.fillText(`Product: ${product.name}`, 20, 55)
        ctx.fillText('AI-powered fitting simulation', 20, 75)
        ctx.fillText('✨ Powered by ShopWise AI', 20, 95)
        
        resolve(canvas.toDataURL('image/jpeg'))
      }
      
      img.src = originalImage
    })
  }

  const downloadResult = () => {
    if (processedImage) {
      const link = document.createElement('a')
      link.download = `virtual-tryon-${product.name.replace(/\s+/g, '-')}.jpg`
      link.href = processedImage
      link.click()
      toast.success('Image downloaded!')
    }
  }

  const resetTryOn = () => {
    setStep('upload')
    setUploadedImage(null)
    setProcessedImage(null)
    setUseCamera(false)
    
    // Stop camera if active
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject
      stream.getTracks().forEach(track => track.stop())
    }
  }

  if (!isTryOnCompatible()) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Virtual Try-On Not Available
              </h3>
              <p className="text-gray-600 mb-6">
                Virtual try-on is currently available for clothing, accessories, and wearable items only.
              </p>
              <button onClick={onClose} className="btn btn-primary">
                Got it
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Virtual Try-On</h2>
                  <p className="text-sm text-gray-600">{product.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {step === 'upload' && (
                <div className="text-center">
                  <div className="mb-8">
                    <Sparkles className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Try On {product.name}
                    </h3>
                    <p className="text-gray-600">
                      Upload a photo or use your camera to see how this item looks on you
                    </p>
                  </div>

                  {!useCamera ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Upload className="w-12 h-12 text-gray-400 mb-4" />
                          <span className="text-lg font-medium text-gray-900">Upload Photo</span>
                          <span className="text-sm text-gray-500">JPG, PNG up to 10MB</span>
                        </button>

                        <button
                          onClick={startCamera}
                          className="flex flex-col items-center p-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <Camera className="w-12 h-12 text-gray-400 mb-4" />
                          <span className="text-lg font-medium text-gray-900">Use Camera</span>
                          <span className="text-sm text-gray-500">Take a photo now</span>
                        </button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full max-w-md mx-auto rounded-lg"
                        />
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                      <div className="flex justify-center space-x-4">
                        <button
                          onClick={capturePhoto}
                          className="btn btn-primary"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Capture Photo
                        </button>
                        <button
                          onClick={() => setUseCamera(false)}
                          className="btn btn-outline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 'processing' && (
                <div className="text-center py-12">
                  <div className="relative">
                    <div className="w-20 h-20 mx-auto mb-6">
                      <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                      <Sparkles className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    AI is working its magic...
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Processing your virtual try-on experience
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '70%' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {step === 'result' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Your Virtual Try-On Result
                    </h3>
                    <p className="text-gray-600">
                      See how {product.name} looks on you!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Original Photo</h4>
                      <img
                        src={uploadedImage}
                        alt="Original"
                        className="w-full rounded-lg border border-gray-200"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Try-On Result</h4>
                      <img
                        src={processedImage}
                        alt="Try-on result"
                        className="w-full rounded-lg border border-gray-200"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={downloadResult}
                      className="btn btn-primary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Result
                    </button>
                    <button
                      onClick={resetTryOn}
                      className="btn btn-outline"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default VirtualTryOn
