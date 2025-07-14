import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { useQuery, useQueryClient } from 'react-query'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useAuth } from './AuthContext'

// Initial state
const initialState = {
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  itemCount: 0,
  discounts: [],
  discountAmount: 0,
  loading: false,
}

// Action types
const CART_ACTIONS = {
  SET_CART: 'SET_CART',
  SET_LOADING: 'SET_LOADING',
  CLEAR_CART: 'CLEAR_CART',
}

// Reducer
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_CART:
      return {
        ...state,
        ...action.payload,
        loading: false,
      }
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...initialState,
        loading: false,
      }
    default:
      return state
  }
}

// Create context
const CartContext = createContext()

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  const { isAuthenticated, user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch cart data when user is authenticated
  const { data: cartData, isLoading } = useQuery(
    'cart',
    () => api.get('/cart'),
    {
      enabled: isAuthenticated,
      onSuccess: (data) => {
        dispatch({
          type: CART_ACTIONS.SET_CART,
          payload: data,
        })
      },
      onError: (error) => {
        console.error('Cart fetch error:', error)
        dispatch({ type: CART_ACTIONS.CLEAR_CART })
      },
    }
  )

  // Clear cart when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      dispatch({ type: CART_ACTIONS.CLEAR_CART })
    }
  }, [isAuthenticated])

  // Set loading state
  useEffect(() => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: isLoading })
  }, [isLoading])

  // Add item to cart
  const addToCart = async (productId, quantity = 1, selectedVariants = []) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return { success: false }
    }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.post('/cart/add', {
        productId,
        quantity,
        selectedVariants,
      })

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response,
      })

      // Update cached cart data
      queryClient.setQueryData('cart', response)

      toast.success('Item added to cart!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add item to cart'
      toast.error(message)
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
      return { success: false, message }
    }
  }

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (!isAuthenticated) return { success: false }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.put(`/cart/update/${itemId}`, { quantity })

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response,
      })

      // Update cached cart data
      queryClient.setQueryData('cart', response)

      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity'
      toast.error(message)
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
      return { success: false, message }
    }
  }

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (!isAuthenticated) return { success: false }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.delete(`/cart/remove/${itemId}`)

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response,
      })

      // Update cached cart data
      queryClient.setQueryData('cart', response)

      toast.success('Item removed from cart')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item'
      toast.error(message)
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
      return { success: false, message }
    }
  }

  // Clear entire cart
  const clearCart = async () => {
    if (!isAuthenticated) return { success: false }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.delete('/cart/clear')

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response,
      })

      // Update cached cart data
      queryClient.setQueryData('cart', response)

      toast.success('Cart cleared')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart'
      toast.error(message)
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
      return { success: false, message }
    }
  }

  // Apply discount code
  const applyDiscount = async (discountCode) => {
    if (!isAuthenticated) return { success: false }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.post('/cart/apply-discount', { discountCode })

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response,
      })

      // Update cached cart data
      queryClient.setQueryData('cart', response)

      toast.success('Discount applied successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to apply discount'
      toast.error(message)
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
      return { success: false, message }
    }
  }

  // Remove discount code
  const removeDiscount = async (discountCode) => {
    if (!isAuthenticated) return { success: false }

    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true })
      
      const response = await api.delete(`/cart/remove-discount/${discountCode}`)

      dispatch({
        type: CART_ACTIONS.SET_CART,
        payload: response,
      })

      // Update cached cart data
      queryClient.setQueryData('cart', response)

      toast.success('Discount removed')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove discount'
      toast.error(message)
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false })
      return { success: false, message }
    }
  }

  // Get cart item count
  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  // Check if product is in cart
  const isInCart = (productId) => {
    return state.items.some(item => item.product._id === productId)
  }

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product._id === productId)
    return item ? item.quantity : 0
  }

  const value = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyDiscount,
    removeDiscount,
    getItemCount,
    isInCart,
    getItemQuantity,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
