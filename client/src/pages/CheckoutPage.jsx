import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, CreditCard } from 'lucide-react'

const CheckoutPage = () => {
  return (
    <div className="container py-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/cart" className="flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Cart
        </Link>

        <div className="text-center py-16">
          <CreditCard className="w-24 h-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Checkout Coming Soon</h1>
          <p className="text-gray-600 mb-8">
            The checkout functionality is currently under development. 
            This would include payment processing, shipping options, and order confirmation.
          </p>
          <div className="space-y-4">
            <Link to="/cart" className="btn btn-primary">
              Back to Cart
            </Link>
            <Link to="/products" className="btn btn-outline ml-4">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
