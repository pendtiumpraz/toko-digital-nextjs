# Toko Digital Next.js - Full Stack SaaS Platform

Platform SaaS lengkap untuk membuat toko online dengan Next.js 15, TypeScript, MongoDB, dan Tailwind CSS. Satu aplikasi untuk frontend dan backend!

## 🚀 Kenapa Next.js Version?

### Keuntungan vs Separate Frontend/Backend:

1. **Single Deployment** - Deploy satu kali ke Vercel, selesai!
2. **No CORS Issues** - Frontend dan backend di domain yang sama
3. **Better SEO** - Server-side rendering untuk landing page
4. **Faster Development** - Satu codebase, satu repo, satu deployment
5. **Cost Effective** - Gratis di Vercel (hobby plan)
6. **Built-in API Routes** - No need for Express.js
7. **Image Optimization** - Next.js Image component
8. **Automatic Code Splitting** - Faster load times
9. **TypeScript Throughout** - Type safety dari frontend ke backend

## 🏗️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB dengan Mongoose
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js / JWT
- **File Upload**: Cloudinary
- **Payment**: Stripe
- **Real-time**: Pusher
- **Email**: Nodemailer
- **Deployment**: Vercel

## 📁 Project Structure

```
toko-digital-nextjs/
├── src/
│   ├── app/                   # App Router pages
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── products/     # Product CRUD
│   │   │   ├── stores/       # Store management
│   │   │   └── orders/       # Order processing
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── [subdomain]/       # Dynamic subdomain routing
│   │   └── page.tsx          # Landing page
│   ├── components/            # React components
│   ├── lib/                   # Utilities & DB connection
│   ├── models/               # Mongoose models
│   └── types/                # TypeScript types
├── public/                    # Static assets
└── .env.local                # Environment variables
```

## 🔧 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local atau MongoDB Atlas)
- Cloudinary account (untuk upload gambar)
- Stripe account (optional, untuk payment)

### Setup Steps

1. **Clone repository**
```bash
git clone https://github.com/yourusername/toko-digital-nextjs.git
cd toko-digital-nextjs
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/toko-digital

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-secret-with-openssl-rand-base64-32

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

4. **Run development server**
```bash
npm run dev
```

Akses di http://localhost:3000

## 🚀 Deployment ke Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/toko-digital-nextjs)

### Manual Deploy

1. **Push ke GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import di Vercel**
- Login ke [Vercel](https://vercel.com)
- Click "New Project"
- Import GitHub repository
- Configure environment variables
- Deploy!

3. **Setup MongoDB Atlas**
- Create free cluster di [MongoDB Atlas](https://www.mongodb.com/atlas)
- Get connection string
- Add ke Vercel environment variables

## 📱 Features

### 🏪 Multi-Tenant Architecture
- Subdomain otomatis: `namatoko.toko-digital.com`
- Custom domain support
- Isolated store data

### 📦 Product Management
- Upload images ke Cloudinary
- YouTube video embed
- Stock management
- Category & variants

### 💬 WhatsApp Integration
- Direct WhatsApp checkout
- No API needed
- Custom message templates

### 💰 Financial Dashboard
- Sales tracking
- Profit calculation
- Export to Excel
- Analytics charts

### 🎯 Subscription System
- Free trial 14 days
- Multiple pricing tiers
- Stripe integration

### 🤖 AI Features
- Product description generator
- Landing page builder
- SEO optimization

## 🔒 API Routes

All API routes are in `/src/app/api/`:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Stores
- `GET /api/stores` - List stores
- `POST /api/stores` - Create store
- `GET /api/stores/[subdomain]` - Get store by subdomain

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - List orders
- `PUT /api/orders/[id]/status` - Update order status

## 🎨 Customization

### Add New API Route

Create file in `/src/app/api/your-route/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  await connectDB();

  // Your logic here

  return NextResponse.json({ success: true });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Your logic here

  return NextResponse.json({ success: true });
}
```

### Add New Model

Create file in `/src/models/YourModel.ts`:

```typescript
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  name: String,
  // ... fields
});

export default mongoose.models.YourModel || mongoose.model('YourModel', schema);
```

### Add New Page

Create file in `/src/app/your-page/page.tsx`:

```typescript
export default function YourPage() {
  return (
    <div>
      <h1>Your Page</h1>
    </div>
  );
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

## 📊 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 2s
- **SEO Score**: 100

## 🔐 Security

- JWT authentication
- Password hashing with bcrypt
- Rate limiting on API routes
- Input validation
- XSS protection
- CSRF protection

## 💡 Tips

1. **Use Server Components** - Fetch data directly in components
2. **Image Optimization** - Use next/image for all images
3. **API Routes** - Keep them in /app/api for automatic API handling
4. **Database Connection** - Reuse connection with singleton pattern
5. **Environment Variables** - Use NEXT_PUBLIC_ prefix for client-side vars

## 🐛 Common Issues

### MongoDB Connection Error
- Check MongoDB URI
- Verify IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Vercel Deployment Fails
- Check build logs
- Verify all environment variables
- Ensure dependencies are in package.json

### Image Upload Not Working
- Verify Cloudinary credentials
- Check upload size limits
- Ensure proper CORS configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License

## 👥 Support

- Email: pendtiumpraz@gmail.com
- GitHub Issues: [Create Issue](https://github.com/yourusername/toko-digital-nextjs/issues)

## 🎯 Roadmap

- [ ] Mobile app with React Native
- [ ] AI-powered inventory prediction
- [ ] Marketplace integrations
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] PWA support
- [ ] Webhook integrations
- [ ] Bulk import/export

---

**Built with ❤️ using Next.js - The Full Stack React Framework**