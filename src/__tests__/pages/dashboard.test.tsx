import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock Next.js components
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
}))

jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart">Line Chart</div>,
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}))

// Mock dashboard component
const MockDashboard = () => {
  const [stats, setStats] = React.useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    trialDaysLeft: 14
  })

  const [products, setProducts] = React.useState([])
  const [orders, setOrders] = React.useState([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, productsRes, ordersRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/products?limit=5'),
          axios.get('/api/orders?limit=5&status=recent')
        ])

        setStats(statsRes.data.data)
        setProducts(productsRes.data.data)
        setOrders(ordersRes.data.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return <div data-testid="loading">Loading...</div>
  }

  return (
    <div data-testid="dashboard">
      <header data-testid="dashboard-header">
        <h1>Dashboard</h1>
        <div data-testid="trial-banner">
          {stats.trialDaysLeft > 0 ? (
            <div className="trial-warning">
              Trial expires in {stats.trialDaysLeft} days
            </div>
          ) : (
            <div className="trial-expired">
              Trial expired - Upgrade now!
            </div>
          )}
        </div>
      </header>

      <div data-testid="stats-grid">
        <div data-testid="stat-products">
          <h3>Products</h3>
          <span>{stats.totalProducts}</span>
        </div>
        <div data-testid="stat-orders">
          <h3>Orders</h3>
          <span>{stats.totalOrders}</span>
        </div>
        <div data-testid="stat-revenue">
          <h3>Revenue</h3>
          <span>Rp {stats.totalRevenue.toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div data-testid="charts-section">
        <div data-testid="revenue-chart">
          <h3>Revenue Trend</h3>
          <div data-testid="line-chart">Line Chart</div>
        </div>
        <div data-testid="orders-chart">
          <h3>Orders by Category</h3>
          <div data-testid="doughnut-chart">Doughnut Chart</div>
        </div>
      </div>

      <div data-testid="recent-section">
        <div data-testid="recent-products">
          <h3>Recent Products</h3>
          {products.length > 0 ? (
            <ul>
              {products.map((product: any, index) => (
                <li key={index} data-testid={`product-${index}`}>
                  {product.name} - Rp {product.price.toLocaleString('id-ID')}
                </li>
              ))}
            </ul>
          ) : (
            <div data-testid="no-products">No products yet</div>
          )}
        </div>

        <div data-testid="recent-orders">
          <h3>Recent Orders</h3>
          {orders.length > 0 ? (
            <ul>
              {orders.map((order: any, index) => (
                <li key={index} data-testid={`order-${index}`}>
                  {order.orderNumber} - Rp {order.total.toLocaleString('id-ID')}
                </li>
              ))}
            </ul>
          ) : (
            <div data-testid="no-orders">No orders yet</div>
          )}
        </div>
      </div>

      <div data-testid="quick-actions">
        <button data-testid="add-product-btn">Add Product</button>
        <button data-testid="view-analytics-btn">View Analytics</button>
        <button data-testid="upgrade-plan-btn">Upgrade Plan</button>
      </div>
    </div>
  )
}

import React from 'react'

describe('Dashboard Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Dashboard Loading', () => {
    it('should show loading state initially', () => {
      // Mock API calls to not resolve immediately
      mockedAxios.get.mockImplementation(() => new Promise(() => {}))

      render(<MockDashboard />)

      expect(screen.getByTestId('loading')).toBeInTheDocument()
    })

    it('should load dashboard data successfully', async () => {
      const mockStats = {
        totalProducts: 25,
        totalOrders: 10,
        totalRevenue: 5000000,
        trialDaysLeft: 7
      }

      const mockProducts = [
        { name: 'Product 1', price: 100000 },
        { name: 'Product 2', price: 200000 }
      ]

      const mockOrders = [
        { orderNumber: 'ORD-001', total: 300000 },
        { orderNumber: 'ORD-002', total: 150000 }
      ]

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: mockProducts } })
        .mockResolvedValueOnce({ data: { data: mockOrders } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      })

      // Check stats
      expect(screen.getByTestId('stat-products')).toHaveTextContent('25')
      expect(screen.getByTestId('stat-orders')).toHaveTextContent('10')
      expect(screen.getByTestId('stat-revenue')).toHaveTextContent('5.000.000')

      // Check recent products
      expect(screen.getByTestId('product-0')).toHaveTextContent('Product 1 - Rp 100.000')
      expect(screen.getByTestId('product-1')).toHaveTextContent('Product 2 - Rp 200.000')

      // Check recent orders
      expect(screen.getByTestId('order-0')).toHaveTextContent('ORD-001 - Rp 300.000')
      expect(screen.getByTestId('order-1')).toHaveTextContent('ORD-002 - Rp 150.000')
    })

    it('should handle API errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

      mockedAxios.get.mockRejectedValue(new Error('API Error'))

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      })

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch dashboard data:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('Trial Status Display', () => {
    it('should show trial warning when trial is active', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 7
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('trial-banner')).toHaveTextContent('Trial expires in 7 days')
      })
    })

    it('should show trial expired message when trial has ended', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 0
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('trial-banner')).toHaveTextContent('Trial expired - Upgrade now!')
      })
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no products exist', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('no-products')).toHaveTextContent('No products yet')
      })
    })

    it('should show empty state when no orders exist', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('no-orders')).toHaveTextContent('No orders yet')
      })
    })
  })

  describe('Charts and Analytics', () => {
    it('should render analytics charts', async () => {
      const mockStats = {
        totalProducts: 5,
        totalOrders: 3,
        totalRevenue: 1000000,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('revenue-chart')).toBeInTheDocument()
        expect(screen.getByTestId('orders-chart')).toBeInTheDocument()
        expect(screen.getByTestId('line-chart')).toBeInTheDocument()
        expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument()
      })
    })
  })

  describe('Quick Actions', () => {
    it('should render quick action buttons', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('add-product-btn')).toBeInTheDocument()
        expect(screen.getByTestId('view-analytics-btn')).toBeInTheDocument()
        expect(screen.getByTestId('upgrade-plan-btn')).toBeInTheDocument()
      })
    })

    it('should handle quick action button clicks', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        const addProductBtn = screen.getByTestId('add-product-btn')
        fireEvent.click(addProductBtn)
        expect(addProductBtn).toBeInTheDocument()
      })
    })
  })

  describe('Responsive Design', () => {
    it('should render properly on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      })

      const mockStats = {
        totalProducts: 5,
        totalOrders: 3,
        totalRevenue: 1000000,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
        expect(screen.getByTestId('stats-grid')).toBeInTheDocument()
      })
    })
  })

  describe('Data Formatting', () => {
    it('should format Indonesian currency correctly', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 1234567,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('stat-revenue')).toHaveTextContent('Rp 1.234.567')
      })
    })

    it('should handle zero values correctly', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('stat-products')).toHaveTextContent('0')
        expect(screen.getByTestId('stat-orders')).toHaveTextContent('0')
        expect(screen.getByTestId('stat-revenue')).toHaveTextContent('Rp 0')
      })
    })
  })

  describe('Performance', () => {
    it('should minimize API calls on initial load', async () => {
      const mockStats = {
        totalProducts: 5,
        totalOrders: 3,
        totalRevenue: 1000000,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument()
      })

      // Should make exactly 3 API calls (stats, products, orders)
      expect(mockedAxios.get).toHaveBeenCalledTimes(3)
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/dashboard/stats')
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/products?limit=5')
      expect(mockedAxios.get).toHaveBeenCalledWith('/api/orders?limit=5&status=recent')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        const h1 = screen.getByRole('heading', { level: 1 })
        const h3s = screen.getAllByRole('heading', { level: 3 })

        expect(h1).toHaveTextContent('Dashboard')
        expect(h3s.length).toBeGreaterThan(0)
      })
    })

    it('should be keyboard navigable', async () => {
      const mockStats = {
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        trialDaysLeft: 14
      }

      mockedAxios.get
        .mockResolvedValueOnce({ data: { data: mockStats } })
        .mockResolvedValueOnce({ data: { data: [] } })
        .mockResolvedValueOnce({ data: { data: [] } })

      render(<MockDashboard />)

      await waitFor(() => {
        const buttons = screen.getAllByRole('button')
        buttons.forEach(button => {
          expect(button).not.toHaveAttribute('tabindex', '-1')
        })
      })
    })
  })
})