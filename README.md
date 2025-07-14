# 🛒 ShopWise AI - Intelligent E-commerce Platform

A modern, full-stack e-commerce platform powered by AI, featuring advanced analytics, multilingual support, and intelligent shopping assistance.

![ShopWise AI](https://img.shields.io/badge/ShopWise-AI%20Powered-blue?style=for-the-badge&logo=react)
![Version](https://img.shields.io/badge/version-1.0.0-green?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-orange?style=for-the-badge)

## ✨ Features

### 🤖 AI-Powered Shopping
- **Smart Product Recommendations** - Personalized suggestions based on user behavior
- **Visual Search** - Upload images to find similar products
- **AI Shopping Assistant** - Voice and text-powered product discovery
- **Intelligent Categorization** - Auto-categorize products with AI

### 🌍 Internationalization
- **Multi-language Support** - English, Hindi (हिंदी), Spanish (Español)
- **Localized Currency** - USD, INR, EUR with proper formatting
- **Cultural Adaptation** - Date formats and number systems per locale
- **Real-time Language Switching** - Seamless language transitions

### 📊 Advanced Analytics
- **Revenue Analytics** - Interactive line charts with monthly trends
- **Category Performance** - Pie charts showing sales distribution
- **Top Products** - Bar charts highlighting best sellers
- **Real-time Insights** - AI-generated performance insights

### 🛍️ Smart Shopping Features
- **Budget Management** - Set spending limits with smart alerts
- **Alternative Suggestions** - 2 cheaper alternatives when budget exceeded
- **Virtual Try-On** - AR-powered product visualization
- **Buy Again** - Quick reorder from purchase history

### 🔐 Security & Authentication
- **JWT Authentication** - Secure user sessions
- **Role-based Access** - Admin, Customer, and Guest roles
- **Password Security** - Bcrypt encryption
- **Rate Limiting** - API protection against abuse

## Project Structure

```
shopwise-ai/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── styles/
│   └── package.json
├── server/                 # Node.js backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   └── package.json
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies:
   ```bash
   cd server
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd client
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

5. Start the development servers:
   ```bash
   # Backend (from server directory)
   npm run dev

   # Frontend (from client directory)
   npm start
   ```

## Deployment

- **Frontend**: Configured for Vercel deployment
- **Backend**: Configured for Render deployment

## Technologies Used

- **Frontend**: React.js, Tailwind CSS, Axios, React Router
- **Backend**: Node.js, Express.js, MongoDB, Mongoose, JWT
- **Authentication**: JSON Web Tokens
- **Styling**: Tailwind CSS
- **Database**: MongoDB with Mongoose ODM

## License

MIT License
