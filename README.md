# Toko Digital Next.js - Full Stack SaaS Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-green)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/license-MIT-purple)](LICENSE)

Platform SaaS lengkap untuk membuat toko online dengan Next.js 15, TypeScript, Prisma, dan Tailwind CSS. Satu aplikasi untuk frontend dan backend dengan WhatsApp checkout integration!

## 📈 Development Progress: 45% Complete
Check [ROADMAP.md](ROADMAP.md) for detailed progress

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
- **Database**: PostgreSQL dengan Prisma ORM
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
│   │   │   ├── page.tsx      # Main dashboard
│   │   │   ├── products/     # Product management
│   │   │   ├── orders/       # Order management
│   │   │   └── analytics/    # Analytics & reports
│   │   ├── [subdomain]/       # Dynamic subdomain routing
│   │   └── page.tsx          # Landing page
│   ├── components/            # React components
│   │   └── WhatsAppCheckout.tsx # WhatsApp checkout flow
│   ├── lib/                   # Utilities & DB connection
│   ├── models/               # Database models
│   └── types/                # TypeScript types
├── public/                    # Static assets
├── prisma/
│   └── schema.prisma         # Database schema
├── docs/                      # Documentation
│   └── API.md                # API documentation
├── __tests__/                 # Test files
├── ROADMAP.md                # Development roadmap
├── RULES.md                  # Development rules
├── CONTRIBUTING.md           # Contribution guidelines
└── .env.local                # Environment variables
```

## ✨ Features

### 🛍️ Core Features
- ✅ **Multi-tenant Architecture** - Setiap toko punya subdomain sendiri
- ✅ **Product Management** - CRUD produk dengan gambar & video
- ✅ **Order Management** - Kelola pesanan dengan status tracking
- ✅ **WhatsApp Checkout** - Customer checkout langsung via WhatsApp
- ✅ **Dashboard Analytics** - Revenue, orders, customers metrics
- ✅ **Stock Management** - Track inventory dengan low stock alerts
- ✅ **Financial Reports** - P&L statements, export to Excel

### 📊 Dashboard Features (NEW!)
- 📈 **Real-time Statistics** - Revenue, orders, conversion rates
- 📦 **Product Management** - Grid view dengan filtering & search
- 🛒 **Order Processing** - Status updates, WhatsApp integration
- 💰 **Financial Analytics** - Charts, trends, customer segments
- 📱 **WhatsApp Integration** - Direct checkout & customer contact

### 🔒 Technical Features
- 🔐 **JWT Authentication** - Secure user sessions
- 📝 **TypeScript Strict Mode** - Type safety enforced
- ✅ **Unit Testing** - Jest & React Testing Library
- 📚 **API Documentation** - Complete REST API docs
- 🚀 **Optimized Performance** - Next.js Image, lazy loading
- 📱 **Responsive Design** - Mobile-first approach

## 🛠️ Development Rules

**⚠️ WAJIB**: Sebelum push ke `main`, jalankan:
```bash
npx tsc --noEmit  # TypeScript check - HARUS no errors!
npm run lint      # Lint check
npm run build     # Build test
npm test          # Run tests
```

Lihat [RULES.md](RULES.md) untuk development guidelines lengkap.

## 🔧 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database (local atau cloud provider seperti Vercel Postgres, Supabase, atau Neon)
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
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/toko-digital"
# Or use Vercel Postgres
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# JWT Secret
JWT_SECRET=your-jwt-secret-key

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

# WhatsApp (optional - for Business API)
WHATSAPP_API_TOKEN=your-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

4. **Setup database**
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Run migrations
npx prisma migrate dev --name init
```

5. **Run development server**
```bash
npm run dev
```

Akses di http://localhost:3000

## 📜 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate test coverage report

# Prisma commands
npm run prisma:generate  # Generate Prisma client
npm run prisma:push      # Push schema to database
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio

# Type checking
npm run type-check   # Run TypeScript type check (tsc --noEmit)
```

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

3. **Setup Database**
- Use Vercel Postgres (recommended) atau
- Setup PostgreSQL di Supabase/Neon
- Add database URL ke Vercel environment variables
- Run `npx prisma db push` via Vercel CLI


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

Update Prisma schema in `/prisma/schema.prisma`:

```prisma
model YourModel {
  id        String   @id @default(cuid())
  name      String
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Then run:
```bash
npx prisma generate
npx prisma db push
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

### Database Connection Error
- Check DATABASE_URL format
- Verify PostgreSQL is running
- For Vercel Postgres, check connection pooling settings
- Run `npx prisma generate` after schema changes

### TypeScript Errors
- Always run `npx tsc --noEmit` before pushing
- Install missing @types packages
- Check tsconfig.json strict settings

### Vercel Deployment Fails
- Check build logs
- Verify all environment variables
- Run `npm run build` locally first
- Ensure Prisma schema is valid

### Image Upload Not Working
- Verify Cloudinary credentials
- Check upload size limits
- Ensure proper CORS configuration

## 🤝 Contributing

Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk guidelines lengkap.

**Sebelum submit PR:**
1. Run `npx tsc --noEmit` - HARUS no errors!
2. Run `npm run lint`
3. Run `npm test`
4. Update documentation
5. Follow commit message format

## 📄 License

MIT License - see [LICENSE](LICENSE) for details

## 👥 Support

- 📧 Email: support@toko-digital.com
- 💬 Discord: [Join our community](https://discord.gg/toko-digital)
- 📖 Documentation: [docs.toko-digital.com](https://docs.toko-digital.com)
- 🐛 Issues: [GitHub Issues](https://github.com/pendtiumpraz/toko-digital-nextjs/issues)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting
- Prisma for the ORM
- All contributors

---

**Made with ❤️ by Toko Digital Team**

*Last updated: December 2024*