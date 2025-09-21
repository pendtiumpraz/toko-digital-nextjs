# API Documentation - Toko Digital SaaS

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://your-domain.vercel.app/api`

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 📍 Authentication Endpoints

### Register New User
```http
POST /api/auth/register
```

#### Request Body
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "081234567890",
  "storeName": "John's Store",
  "subdomain": "johnstore"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STORE_OWNER",
      "store": "clyyy..."
    },
    "token": "eyJhbGc..."
  }
}
```

### Login
```http
POST /api/auth/login
```

#### Request Body
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "STORE_OWNER",
      "store": "clyyy..."
    },
    "token": "eyJhbGc..."
  }
}
```

### Get Current User
```http
GET /api/auth/me
```

**Authentication:** Required

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "STORE_OWNER",
    "store": {
      "id": "clyyy...",
      "name": "John's Store",
      "subdomain": "johnstore"
    },
    "subscription": {
      "plan": "FREE",
      "status": "TRIAL",
      "trialEndDate": "2024-02-14T00:00:00Z"
    }
  }
}
```

### Logout
```http
POST /api/auth/logout
```

**Authentication:** Required

#### Response
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Forgot Password
```http
POST /api/auth/forgot-password
```

#### Request Body
```json
{
  "email": "john@example.com"
}
```

#### Response
```json
{
  "success": true,
  "message": "Password reset link sent to email"
}
```

### Reset Password
```http
POST /api/auth/reset-password
```

#### Request Body
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

#### Response
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 📍 Store Endpoints

### Get All Stores
```http
GET /api/stores
```

**Authentication:** Required

#### Query Parameters
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by store name

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "clyyy...",
      "name": "John's Store",
      "subdomain": "johnstore",
      "whatsappNumber": "081234567890",
      "isActive": true,
      "totalProducts": 25,
      "totalRevenue": 5000000
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

### Get Store by ID
```http
GET /api/stores/:storeId
```

**Authentication:** Required

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clyyy...",
    "name": "John's Store",
    "description": "Best electronics store",
    "subdomain": "johnstore",
    "customDomain": "johnstore.com",
    "whatsappNumber": "081234567890",
    "email": "contact@johnstore.com",
    "address": {
      "street": "Jl. Sudirman No. 1",
      "city": "Jakarta",
      "state": "DKI Jakarta",
      "country": "Indonesia",
      "postalCode": "12345"
    },
    "socialMedia": {
      "facebook": "johnstore",
      "instagram": "@johnstore",
      "twitter": "@johnstore"
    },
    "theme": {
      "primaryColor": "#007bff",
      "secondaryColor": "#6c757d",
      "fontFamily": "Inter",
      "layout": "GRID"
    },
    "storageUsed": 52428800,
    "storageLimit": 104857600,
    "productLimit": 50,
    "totalSales": 150,
    "totalRevenue": 15000000,
    "rating": 4.5,
    "totalReviews": 30
  }
}
```

### Create Store
```http
POST /api/stores
```

**Authentication:** Required

#### Request Body
```json
{
  "name": "New Store",
  "description": "Store description",
  "subdomain": "newstore",
  "whatsappNumber": "081234567890",
  "email": "contact@newstore.com",
  "address": {
    "street": "Jl. Example",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "country": "Indonesia",
    "postalCode": "12345"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clzzz...",
    "name": "New Store",
    "subdomain": "newstore"
  }
}
```

### Update Store
```http
PUT /api/stores/:storeId
```

**Authentication:** Required (Store Owner only)

#### Request Body
```json
{
  "name": "Updated Store Name",
  "description": "Updated description",
  "whatsappNumber": "081234567890",
  "theme": {
    "primaryColor": "#28a745",
    "layout": "LIST"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clyyy...",
    "name": "Updated Store Name"
  }
}
```

### Delete Store
```http
DELETE /api/stores/:storeId
```

**Authentication:** Required (Admin only)

#### Response
```json
{
  "success": true,
  "message": "Store deleted successfully"
}
```

---

## 📍 Product Endpoints

### Get Products
```http
GET /api/products
```

#### Query Parameters
- `storeId` (string): Filter by store ID
- `category` (string): Filter by category
- `featured` (boolean): Show featured products only
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `search` (string): Search in name and description
- `sort` (string): Sort by field (price, name, createdAt)
- `order` (string): Sort order (asc, desc)
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "iPhone 15 Pro",
      "description": "Latest iPhone with titanium design",
      "category": "ELECTRONICS",
      "price": 20000000,
      "comparePrice": 22000000,
      "stock": 10,
      "images": [
        {
          "url": "https://example.com/image1.jpg",
          "isPrimary": true
        }
      ],
      "rating": {
        "average": 4.8,
        "count": 25
      },
      "store": {
        "id": "clyyy...",
        "name": "John's Store",
        "subdomain": "johnstore"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "pages": 5,
    "limit": 20
  }
}
```

### Get Product by ID
```http
GET /api/products/:productId
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "iPhone 15 Pro",
    "description": "Latest iPhone with titanium design",
    "category": "ELECTRONICS",
    "subCategory": "Smartphones",
    "price": 20000000,
    "comparePrice": 22000000,
    "cost": 15000000,
    "profit": 5000000,
    "profitMargin": 25,
    "sku": "IPH15PRO-256",
    "barcode": "1234567890123",
    "stock": 10,
    "trackInventory": true,
    "lowStockAlert": 5,
    "weight": 0.2,
    "weightUnit": "KG",
    "dimensions": {
      "length": 15,
      "width": 7,
      "height": 1,
      "unit": "CM"
    },
    "images": [
      {
        "id": "img1",
        "url": "https://example.com/image1.jpg",
        "alt": "Front view",
        "isPrimary": true,
        "source": "UPLOAD"
      }
    ],
    "videos": [
      {
        "id": "vid1",
        "url": "https://youtube.com/watch?v=xxx",
        "title": "Product Review",
        "source": "YOUTUBE"
      }
    ],
    "tags": ["smartphone", "apple", "premium"],
    "seo": {
      "metaTitle": "iPhone 15 Pro - Best Price",
      "metaDescription": "Get the latest iPhone 15 Pro at the best price",
      "slug": "iphone-15-pro"
    },
    "visibility": "VISIBLE",
    "featured": true,
    "views": 1250,
    "sold": 15,
    "rating": {
      "average": 4.8,
      "count": 25
    },
    "store": {
      "id": "clyyy...",
      "name": "John's Store",
      "subdomain": "johnstore",
      "whatsappNumber": "081234567890"
    }
  }
}
```

### Create Product
```http
POST /api/products
```

**Authentication:** Required (Store Owner)

#### Request Body
```json
{
  "storeId": "clyyy...",
  "name": "New Product",
  "description": "Product description",
  "category": "ELECTRONICS",
  "price": 1000000,
  "comparePrice": 1200000,
  "cost": 700000,
  "stock": 50,
  "sku": "PROD-001",
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "isPrimary": true
    }
  ],
  "tags": ["new", "electronics"]
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clnew...",
    "name": "New Product",
    "slug": "new-product"
  }
}
```

### Update Product
```http
PUT /api/products/:productId
```

**Authentication:** Required (Store Owner)

#### Request Body
```json
{
  "name": "Updated Product Name",
  "price": 1100000,
  "stock": 45
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Updated Product Name"
  }
}
```

### Delete Product
```http
DELETE /api/products/:productId
```

**Authentication:** Required (Store Owner)

#### Response
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Upload Product Images
```http
POST /api/products/:productId/images
```

**Authentication:** Required (Store Owner)

#### Request Body (multipart/form-data)
- `images`: File array (max 10 files)

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "imgxxx...",
      "url": "https://cloudinary.com/uploaded-image.jpg",
      "isPrimary": false
    }
  ]
}
```

---

## 📍 Order Endpoints

### Create Order
```http
POST /api/orders
```

#### Request Body
```json
{
  "storeId": "clyyy...",
  "customerName": "Jane Doe",
  "customerEmail": "jane@example.com",
  "customerPhone": "081234567890",
  "customerWhatsapp": "081234567890",
  "shippingAddress": {
    "street": "Jl. Customer",
    "city": "Jakarta",
    "state": "DKI Jakarta",
    "country": "Indonesia",
    "postalCode": "12345",
    "notes": "Near the blue gate"
  },
  "items": [
    {
      "productId": "clxxx...",
      "quantity": 2,
      "price": 1000000
    }
  ],
  "shipping": 20000,
  "paymentMethod": "BANK_TRANSFER"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order123...",
    "orderNumber": "ORD-20240101-001",
    "total": 2020000,
    "status": "PENDING",
    "whatsappUrl": "https://wa.me/62812345678?text=..."
  }
}
```

### Get Orders
```http
GET /api/orders
```

**Authentication:** Required

#### Query Parameters
- `storeId` (string): Filter by store ID (required for store owners)
- `status` (string): Filter by status
- `dateFrom` (string): Start date filter
- `dateTo` (string): End date filter
- `page` (number): Page number
- `limit` (number): Items per page

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "order123...",
      "orderNumber": "ORD-20240101-001",
      "customerName": "Jane Doe",
      "total": 2020000,
      "status": "PENDING",
      "paymentStatus": "PENDING",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

### Get Order by ID
```http
GET /api/orders/:orderId
```

**Authentication:** Required

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order123...",
    "orderNumber": "ORD-20240101-001",
    "customer": {
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "081234567890",
      "whatsapp": "081234567890"
    },
    "shippingAddress": {
      "street": "Jl. Customer",
      "city": "Jakarta",
      "state": "DKI Jakarta",
      "country": "Indonesia",
      "postalCode": "12345"
    },
    "items": [
      {
        "product": {
          "id": "clxxx...",
          "name": "iPhone 15 Pro"
        },
        "quantity": 2,
        "price": 1000000,
        "subtotal": 2000000
      }
    ],
    "pricing": {
      "subtotal": 2000000,
      "shipping": 20000,
      "tax": 0,
      "discount": 0,
      "total": 2020000
    },
    "payment": {
      "method": "BANK_TRANSFER",
      "status": "PENDING"
    },
    "status": "PENDING",
    "createdAt": "2024-01-01T10:00:00Z"
  }
}
```

### Update Order Status
```http
PUT /api/orders/:orderId/status
```

**Authentication:** Required (Store Owner)

#### Request Body
```json
{
  "status": "PROCESSING",
  "note": "Order is being prepared"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "order123...",
    "status": "PROCESSING"
  }
}
```

---

## 📍 Chat/Message Endpoints

### Send Message
```http
POST /api/chat/send
```

#### Request Body
```json
{
  "storeId": "clyyy...",
  "customerName": "Jane Doe",
  "customerPhone": "081234567890",
  "message": "Hello, is this product available?",
  "productId": "clxxx..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "chatId": "chat123...",
    "messageId": "msg456..."
  }
}
```

### Get Chat Messages
```http
GET /api/chat/:chatId/messages
```

**Authentication:** Required

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "msg123...",
      "senderType": "CUSTOMER",
      "senderName": "Jane Doe",
      "message": "Hello, is this product available?",
      "isRead": true,
      "createdAt": "2024-01-01T10:00:00Z"
    },
    {
      "id": "msg124...",
      "senderType": "STORE_OWNER",
      "senderName": "John",
      "message": "Yes, it's available. Would you like to order?",
      "isRead": false,
      "createdAt": "2024-01-01T10:05:00Z"
    }
  ]
}
```

---

## 📍 WhatsApp Integration

### Generate WhatsApp Link
```http
POST /api/whatsapp/generate-link
```

#### Request Body
```json
{
  "storeId": "clyyy...",
  "productId": "clxxx...",
  "type": "inquiry"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "link": "https://wa.me/6281234567890?text=Halo%20saya%20tertarik...",
    "phoneNumber": "6281234567890",
    "message": "Halo, saya tertarik dengan produk iPhone 15 Pro..."
  }
}
```

### Generate Checkout Link
```http
POST /api/whatsapp/checkout
```

#### Request Body
```json
{
  "storeId": "clyyy...",
  "items": [
    {
      "productId": "clxxx...",
      "quantity": 2
    }
  ],
  "customer": {
    "name": "Jane Doe",
    "phone": "081234567890",
    "address": "Jl. Customer No. 1"
  }
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "link": "https://wa.me/6281234567890?text=ORDER%20BARU...",
    "total": 2000000,
    "message": "ORDER BARU\n\nProduk:\n- iPhone 15 Pro x2\n\nTotal: Rp 2.000.000"
  }
}
```

---

## 📍 Analytics Endpoints

### Get Store Analytics
```http
GET /api/analytics/store/:storeId
```

**Authentication:** Required (Store Owner)

#### Query Parameters
- `period` (string): Period filter (today, week, month, year)
- `dateFrom` (string): Start date
- `dateTo` (string): End date

#### Response
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 50000000,
      "growth": 15.5,
      "chart": [
        { "date": "2024-01-01", "value": 1000000 },
        { "date": "2024-01-02", "value": 1500000 }
      ]
    },
    "orders": {
      "total": 150,
      "growth": 10.2,
      "chart": [
        { "date": "2024-01-01", "count": 5 },
        { "date": "2024-01-02", "count": 8 }
      ]
    },
    "products": {
      "total": 45,
      "topSelling": [
        {
          "id": "clxxx...",
          "name": "iPhone 15 Pro",
          "sold": 25,
          "revenue": 500000000
        }
      ]
    },
    "customers": {
      "total": 120,
      "new": 15,
      "returning": 105
    },
    "traffic": {
      "visits": 5000,
      "uniqueVisitors": 3500,
      "pageViews": 12000,
      "bounceRate": 35.5
    }
  }
}
```

### Export Analytics
```http
GET /api/analytics/export
```

**Authentication:** Required (Store Owner)

#### Query Parameters
- `storeId` (string): Store ID
- `format` (string): Export format (excel, csv, pdf)
- `period` (string): Period to export

#### Response
Returns file download

---

## 📍 Subscription Endpoints

### Get Subscription Plans
```http
GET /api/subscriptions/plans
```

#### Response
```json
{
  "success": true,
  "data": [
    {
      "plan": "FREE",
      "name": "Free Plan",
      "price": {
        "monthly": 0,
        "yearly": 0
      },
      "features": {
        "productLimit": 10,
        "storageLimit": 104857600,
        "customDomain": false,
        "aiLandingPage": false
      }
    },
    {
      "plan": "STARTER",
      "name": "Starter",
      "price": {
        "monthly": 99000,
        "yearly": 990000
      },
      "features": {
        "productLimit": 100,
        "storageLimit": 1073741824,
        "customDomain": false,
        "aiLandingPage": false
      }
    }
  ]
}
```

### Get Current Subscription
```http
GET /api/subscriptions/current
```

**Authentication:** Required

#### Response
```json
{
  "success": true,
  "data": {
    "plan": "FREE",
    "status": "TRIAL",
    "trialEndDate": "2024-02-14T00:00:00Z",
    "features": {
      "productLimit": 10,
      "storageLimit": 104857600,
      "customDomain": false
    },
    "usage": {
      "products": 5,
      "storage": 52428800
    }
  }
}
```

### Upgrade Subscription
```http
POST /api/subscriptions/upgrade
```

**Authentication:** Required

#### Request Body
```json
{
  "plan": "PROFESSIONAL",
  "billingCycle": "YEARLY",
  "paymentMethodId": "pm_xxx..."
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_xxx...",
    "plan": "PROFESSIONAL",
    "status": "ACTIVE",
    "nextBillingDate": "2025-01-01T00:00:00Z"
  }
}
```

---

## Error Responses

All endpoints may return error responses in the following format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `TRIAL_EXPIRED` | 403 | Free trial has expired |
| `LIMIT_EXCEEDED` | 403 | Plan limit exceeded |

---

## Rate Limiting

- Default rate limit: 100 requests per 15 minutes per IP
- Authenticated users: 500 requests per 15 minutes
- File uploads: 10 requests per hour

---

## Webhooks

### Available Webhook Events

- `order.created`
- `order.updated`
- `order.completed`
- `payment.success`
- `payment.failed`
- `subscription.upgraded`
- `subscription.cancelled`
- `product.low_stock`

### Webhook Payload Example

```json
{
  "event": "order.created",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": {
    "orderId": "order123...",
    "storeId": "clyyy...",
    "total": 2000000
  }
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { TokoDigitalAPI } from '@toko-digital/sdk';

const api = new TokoDigitalAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://api.toko-digital.com'
});

// Get products
const products = await api.products.list({
  storeId: 'clyyy...',
  category: 'ELECTRONICS'
});

// Create order
const order = await api.orders.create({
  storeId: 'clyyy...',
  items: [...]
});
```

### cURL Examples
```bash
# Get products
curl -X GET "https://api.toko-digital.com/api/products?storeId=clyyy" \
  -H "Authorization: Bearer your-token"

# Create product
curl -X POST "https://api.toko-digital.com/api/products" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{"name":"Product","price":100000}'
```

---

## Support

For API support and questions:
- Email: api@toko-digital.com
- Documentation: https://docs.toko-digital.com
- Status Page: https://status.toko-digital.com