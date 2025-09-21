import { GET, POST } from '@/app/api/products/route'
import { NextRequest } from 'next/server'
import Product from '@/models/Product'
import Store from '@/models/Store'

jest.mock('@/models/Product')
jest.mock('@/models/Store')
jest.mock('@/lib/mongodb', () => ({
  default: jest.fn(() => Promise.resolve()),
}))

describe('/api/products', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products', () => {
    it('should return products with pagination', async () => {
      const mockProducts = [
        {
          _id: 'prod1',
          name: 'Product 1',
          price: 100000,
          category: 'ELECTRONICS',
          stock: 10,
        },
        {
          _id: 'prod2',
          name: 'Product 2',
          price: 200000,
          category: 'FASHION',
          stock: 20,
        },
      ]

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue(mockProducts),
      }

      ;(Product.find as jest.Mock).mockReturnValue(mockQuery)
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/products?page=1&limit=10')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveLength(2)
      expect(data.pagination.total).toBe(2)
      expect(data.pagination.page).toBe(1)
    })

    it('should filter products by storeId', async () => {
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([]),
      }

      ;(Product.find as jest.Mock).mockReturnValue(mockQuery)
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/products?storeId=store123')

      await GET(request)

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          store: 'store123',
          isActive: true,
        })
      )
    })

    it('should filter products by category', async () => {
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([]),
      }

      ;(Product.find as jest.Mock).mockReturnValue(mockQuery)
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/products?category=ELECTRONICS')

      await GET(request)

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'ELECTRONICS',
          isActive: true,
        })
      )
    })

    it('should handle featured products filter', async () => {
      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockResolvedValue([]),
      }

      ;(Product.find as jest.Mock).mockReturnValue(mockQuery)
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(0)

      const request = new NextRequest('http://localhost:3000/api/products?featured=true')

      await GET(request)

      expect(Product.find).toHaveBeenCalledWith(
        expect.objectContaining({
          featured: true,
          isActive: true,
        })
      )
    })
  })

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const mockStore = {
        _id: 'store123',
        productLimit: 100,
      }

      const mockProduct = {
        _id: 'prod123',
        name: 'New Product',
        price: 150000,
        store: 'store123',
      }

      ;(Store.findById as jest.Mock).mockResolvedValue(mockStore)
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(10)
      ;(Product.create as jest.Mock).mockResolvedValue(mockProduct)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          storeId: 'store123',
          name: 'New Product',
          description: 'Product description',
          category: 'ELECTRONICS',
          price: 150000,
          stock: 50,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.name).toBe('New Product')
    })

    it('should return error if store not found', async () => {
      ;(Store.findById as jest.Mock).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          storeId: 'invalid-store',
          name: 'New Product',
          price: 150000,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Store not found')
    })

    it('should check product limit', async () => {
      const mockStore = {
        _id: 'store123',
        productLimit: 10,
      }

      ;(Store.findById as jest.Mock).mockResolvedValue(mockStore)
      ;(Product.countDocuments as jest.Mock).mockResolvedValue(10) // Already at limit

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          storeId: 'store123',
          name: 'New Product',
          price: 150000,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('Product limit reached')
    })

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          storeId: 'store123',
          // Missing required fields
        }),
      })

      const response = await POST(request)

      expect(response.status).toBe(500)
    })

    it('should handle database errors', async () => {
      ;(Store.findById as jest.Mock).mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          storeId: 'store123',
          name: 'Product',
          price: 100000,
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('Database error')
    })
  })
})