import React, { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en')
  const [isChanging, setIsChanging] = useState(false)

  // Available languages
  const languages = [
    {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flag: '🇺🇸'
    },
    {
      code: 'hi',
      name: 'Hindi',
      nativeName: 'हिंदी',
      flag: '🇮🇳'
    },
    {
      code: 'es',
      name: 'Spanish',
      nativeName: 'Español',
      flag: '🇪🇸'
    }
  ]

  // Update current language when i18n language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  // Change language function
  const changeLanguage = async (languageCode) => {
    if (languageCode === currentLanguage) return

    setIsChanging(true)
    
    try {
      await i18n.changeLanguage(languageCode)
      
      // Store in localStorage
      localStorage.setItem('shopwise-language', languageCode)
      
      // Get language name for toast
      const language = languages.find(lang => lang.code === languageCode)
      const languageName = language ? language.nativeName : languageCode
      
      // Show success toast
      toast.success(t('language.languageChanged', { language: languageName }))
      
      // Update document language attribute
      document.documentElement.lang = languageCode
      
      // Update document direction for RTL languages (if needed in future)
      const rtlLanguages = ['ar', 'he', 'fa']
      document.documentElement.dir = rtlLanguages.includes(languageCode) ? 'rtl' : 'ltr'
      
    } catch (error) {
      console.error('Error changing language:', error)
      toast.error('Failed to change language')
    } finally {
      setIsChanging(false)
    }
  }

  // Get current language info
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0]
  }

  // Get language direction
  const getLanguageDirection = () => {
    const rtlLanguages = ['ar', 'he', 'fa']
    return rtlLanguages.includes(currentLanguage) ? 'rtl' : 'ltr'
  }

  // Format text with language-specific formatting
  const formatText = (text, options = {}) => {
    if (!text) return ''
    
    // Apply language-specific text transformations if needed
    switch (currentLanguage) {
      case 'hi':
        // Hindi-specific formatting
        return text
      case 'es':
        // Spanish-specific formatting
        return text
      default:
        return text
    }
  }

  // Get localized currency format
  const formatCurrency = (amount, currency = 'USD') => {
    const locale = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES'
    }[currentLanguage] || 'en-US'

    const currencyCode = {
      'en': 'USD',
      'hi': 'INR',
      'es': 'EUR'
    }[currentLanguage] || currency

    try {
      return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode,
      }).format(amount)
    } catch (error) {
      // Fallback to USD if currency is not supported
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(amount)
    }
  }

  // Get localized date format
  const formatDate = (date, options = {}) => {
    const locale = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES'
    }[currentLanguage] || 'en-US'

    const defaultOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    }

    try {
      return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date))
    } catch (error) {
      return new Date(date).toLocaleDateString()
    }
  }

  // Get localized number format
  const formatNumber = (number, options = {}) => {
    const locale = {
      'en': 'en-US',
      'hi': 'hi-IN',
      'es': 'es-ES'
    }[currentLanguage] || 'en-US'

    try {
      return new Intl.NumberFormat(locale, options).format(number)
    } catch (error) {
      return number.toString()
    }
  }

  const value = {
    // Current language state
    currentLanguage,
    languages,
    isChanging,
    
    // Language operations
    changeLanguage,
    getCurrentLanguage,
    getLanguageDirection,
    
    // Formatting utilities
    formatText,
    formatCurrency,
    formatDate,
    formatNumber,
    
    // Translation function (re-export for convenience)
    t,
    i18n
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export default LanguageContext
