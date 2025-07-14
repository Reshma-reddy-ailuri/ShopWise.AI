import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
)

// Common chart colors
export const chartColors = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
  light: '#F3F4F6',
  dark: '#1F2937',
  walmart: '#0071CE',
  walmartYellow: '#FFC220'
}

// Color palettes for different chart types
export const colorPalettes = {
  revenue: [
    chartColors.walmart,
    chartColors.primary,
    chartColors.secondary,
    chartColors.success,
    chartColors.warning
  ],
  categories: [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#FF6384',
    '#C9CBCF',
    '#4BC0C0',
    '#FF6384'
  ],
  products: [
    chartColors.walmart,
    chartColors.walmartYellow,
    chartColors.primary,
    chartColors.secondary,
    chartColors.success,
    chartColors.warning,
    chartColors.info,
    chartColors.danger
  ]
}

// Default chart options
export const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        usePointStyle: true,
        padding: 20,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: chartColors.primary,
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        color: '#6B7280'
      }
    },
    y: {
      grid: {
        color: '#F3F4F6',
        borderDash: [2, 2]
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        color: '#6B7280'
      }
    }
  }
}

// Revenue line chart options
export const revenueChartOptions = {
  ...defaultOptions,
  plugins: {
    ...defaultOptions.plugins,
    title: {
      display: true,
      text: 'Revenue Trend',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif"
      },
      color: '#1F2937',
      padding: 20
    }
  },
  scales: {
    ...defaultOptions.scales,
    y: {
      ...defaultOptions.scales.y,
      beginAtZero: true,
      ticks: {
        ...defaultOptions.scales.y.ticks,
        callback: function(value) {
          return '$' + value.toLocaleString()
        }
      }
    }
  }
}

// Category pie chart options
export const categoryChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        usePointStyle: true,
        padding: 15,
        font: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      }
    },
    title: {
      display: true,
      text: 'Sales by Category',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif"
      },
      color: '#1F2937',
      padding: 20
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: chartColors.primary,
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: function(context) {
          const label = context.label || ''
          const value = context.parsed || 0
          const total = context.dataset.data.reduce((a, b) => a + b, 0)
          const percentage = ((value / total) * 100).toFixed(1)
          return `${label}: $${value.toLocaleString()} (${percentage}%)`
        }
      }
    }
  }
}

// Top products bar chart options
export const productsChartOptions = {
  ...defaultOptions,
  indexAxis: 'y',
  plugins: {
    ...defaultOptions.plugins,
    title: {
      display: true,
      text: 'Top Selling Products',
      font: {
        size: 16,
        weight: 'bold',
        family: "'Inter', sans-serif"
      },
      color: '#1F2937',
      padding: 20
    },
    legend: {
      display: false
    }
  },
  scales: {
    x: {
      grid: {
        color: '#F3F4F6',
        borderDash: [2, 2]
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        color: '#6B7280'
      }
    },
    y: {
      grid: {
        display: false
      },
      ticks: {
        font: {
          size: 11,
          family: "'Inter', sans-serif"
        },
        color: '#6B7280'
      }
    }
  }
}

// Utility functions for chart data formatting
export const formatChartData = {
  revenue: (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    return {
      labels: data.map(item => `${months[item._id.month - 1]} ${item._id.year}`),
      datasets: [{
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: chartColors.walmart,
        backgroundColor: chartColors.walmart + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: chartColors.walmart,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    }
  },

  categories: (data) => ({
    labels: data.map(item => item._id || 'Unknown'),
    datasets: [{
      data: data.map(item => item.revenue),
      backgroundColor: colorPalettes.categories.slice(0, data.length),
      borderColor: '#fff',
      borderWidth: 2,
      hoverBorderWidth: 3
    }]
  }),

  products: (data) => ({
    labels: data.map(item => item.productName?.substring(0, 30) + '...' || 'Unknown Product'),
    datasets: [{
      label: 'Quantity Sold',
      data: data.map(item => item.totalQuantity),
      backgroundColor: colorPalettes.products.slice(0, data.length),
      borderColor: chartColors.walmart,
      borderWidth: 1,
      borderRadius: 4,
      borderSkipped: false
    }]
  })
}

export default ChartJS
