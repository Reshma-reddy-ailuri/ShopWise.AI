import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AIAssistant from '../AI/AIAssistant'
import FloatingHelp from '../UI/FloatingHelp'
import FloatingNotifications from '../UI/FloatingNotifications'

const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1">
        <Outlet />
      </main>
      
      <Footer />

      {/* AI Shopping Assistant - Fixed position */}
      <AIAssistant />

      {/* Floating Help Button */}
      <FloatingHelp />

      {/* Floating Notifications */}
      <FloatingNotifications />
    </div>
  )
}

export default Layout
