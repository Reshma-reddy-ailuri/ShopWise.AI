import React, { useState, useRef, useEffect } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../../context/LanguageContext'
import { useTranslation } from 'react-i18next'

const LanguageSwitcher = ({ 
  variant = 'default', // 'default' | 'compact' | 'icon-only'
  position = 'bottom-right', // 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)
  const { currentLanguage, languages, changeLanguage, isChanging, getCurrentLanguage } = useLanguage()
  const { t } = useTranslation()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLanguageSelect = async (languageCode) => {
    setIsOpen(false)
    await changeLanguage(languageCode)
  }

  const currentLang = getCurrentLanguage()

  // Position classes for dropdown
  const positionClasses = {
    'bottom-right': 'top-full right-0 mt-2',
    'bottom-left': 'top-full left-0 mt-2',
    'top-right': 'bottom-full right-0 mb-2',
    'top-left': 'bottom-full left-0 mb-2'
  }

  // Variant styles
  const getButtonClasses = () => {
    const baseClasses = 'flex items-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    
    switch (variant) {
      case 'compact':
        return `${baseClasses} px-2 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50`
      case 'icon-only':
        return `${baseClasses} p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full`
      default:
        return `${baseClasses} px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50`
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Language Switcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isChanging}
        className={`${getButtonClasses()} ${isChanging ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={t('language.selectLanguage')}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Loading state */}
        {isChanging ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            {variant !== 'icon-only' && (
              <span className="text-sm text-gray-600">{t('common.loading')}</span>
            )}
          </div>
        ) : (
          <>
            {/* Globe icon */}
            <Globe className="w-4 h-4 text-gray-600" />
            
            {/* Language info (hidden in icon-only variant) */}
            {variant !== 'icon-only' && (
              <>
                <span className="mx-2 text-sm font-medium text-gray-900">
                  {variant === 'compact' ? currentLang.code.toUpperCase() : currentLang.nativeName}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 ${positionClasses[position]} min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1`}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {t('language.selectLanguage')}
              </p>
            </div>

            {/* Language Options */}
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language.code)}
                  className={`w-full flex items-center px-3 py-2 text-sm transition-colors duration-150 ${
                    language.code === currentLanguage
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  disabled={isChanging}
                >
                  {/* Flag */}
                  <span className="text-lg mr-3" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  
                  {/* Language names */}
                  <div className="flex-1 text-left">
                    <div className="font-medium">{language.nativeName}</div>
                    {language.nativeName !== language.name && (
                      <div className="text-xs text-gray-500">{language.name}</div>
                    )}
                  </div>
                  
                  {/* Check mark for current language */}
                  {language.code === currentLanguage && (
                    <Check className="w-4 h-4 text-blue-600" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {t('language.languageChanged', { language: currentLang.nativeName })}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LanguageSwitcher
