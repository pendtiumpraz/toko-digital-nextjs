import { POST } from '@/app/api/auth/register/route'
import { NextRequest } from 'next/server'
import User from '@/models/User'
import Store from '@/models/Store'

// Mock the models
jest.mock('@/models/User')
jest.mock('@/models/Store')
jest.mock('@/lib/mongodb', () => ({
  default: jest.fn(() => Promise.resolve()),
}))

describe('/api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register a new user successfully', async () => {
    const mockUser = {
      _id: 'user123',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'store_owner',
      save: jest.fn(),
    }

    const mockStore = {
      _id: 'store123',
      name: "John's Store",
      subdomain: 'johnstore',
    }

    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    ;(Store.findOne as jest.Mock).mockResolvedValue(null)
    ;(User.create as jest.Mock).mockResolvedValue(mockUser)
    ;(Store.create as jest.Mock).mockResolvedValue(mockStore)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        phone: '081234567890',
        storeName: "John's Store",
        subdomain: 'johnstore',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.user.email).toBe('john@example.com')
    expect(data.data.token).toBeDefined()
  })

  it('should return error if email already exists', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue({ email: 'john@example.com' })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        phone: '081234567890',
        storeName: "John's Store",
        subdomain: 'johnstore',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Email already registered')
  })

  it('should return error if subdomain already exists', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    ;(Store.findOne as jest.Mock).mockResolvedValue({ subdomain: 'johnstore' })

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        phone: '081234567890',
        storeName: "John's Store",
        subdomain: 'johnstore',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Subdomain already taken')
  })

  it('should validate required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'john@example.com',
        // Missing required fields
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })

  it('should validate email format', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'invalid-email',
        password: 'securePassword123',
        phone: '081234567890',
        storeName: "John's Store",
        subdomain: 'johnstore',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })

  it('should validate subdomain format', async () => {
    ;(User.findOne as jest.Mock).mockResolvedValue(null)
    ;(Store.findOne as jest.Mock).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword123',
        phone: '081234567890',
        storeName: "John's Store",
        subdomain: 'Invalid Subdomain!', // Invalid format
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(500)
  })
})