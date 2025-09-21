# 📋 Development Rules - Toko Digital SaaS

## 🚨 MANDATORY PRE-PUSH CHECKLIST

**⚠️ WAJIB: Sebelum push ke branch `main`, HARUS menjalankan semua checks berikut:**

### 1. ✅ TypeScript Check (WAJIB)
```bash
npx tsc --noEmit
```
**RULE**: Tidak boleh ada error TypeScript. Semua error HARUS diperbaiki sebelum push.

### 2. ✅ Lint Check
```bash
npm run lint
```
**RULE**: Fix semua lint warnings dan errors.

### 3. ✅ Build Test
```bash
npm run build
```
**RULE**: Build harus berhasil tanpa error.

### 4. ✅ Unit Tests
```bash
npm test
```
**RULE**: Semua tests harus pass.

### 5. ✅ Update Documentation
- Update `ROADMAP.md` dengan progress terbaru
- Update `README.md` jika ada fitur baru
- Update API documentation jika ada endpoint baru

---

## 🔧 Development Standards

### 📝 Code Quality Rules

#### TypeScript
- ✅ **WAJIB** gunakan TypeScript untuk semua file baru
- ✅ **WAJIB** definisikan types/interfaces untuk semua data structures
- ✅ **WAJIB** hindari penggunaan `any` kecuali absolutely necessary
- ✅ **WAJIB** gunakan strict mode TypeScript

```typescript
// ❌ BAD
const handleData = (data: any) => { ... }

// ✅ GOOD
interface UserData {
  id: string;
  name: string;
  email: string;
}
const handleData = (data: UserData) => { ... }
```

#### Component Standards
- ✅ Gunakan functional components dengan hooks
- ✅ Implement proper error boundaries
- ✅ Add loading states untuk async operations
- ✅ Implement proper TypeScript props interfaces

```typescript
// ✅ GOOD Component Example
interface ProductCardProps {
  product: Product;
  onAddToCart: (id: string) => void;
  isLoading?: boolean;
}

export default function ProductCard({
  product,
  onAddToCart,
  isLoading = false
}: ProductCardProps) {
  // Component implementation
}
```

### 🗂️ File Organization

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable components
│   ├── ui/             # Basic UI components
│   ├── layouts/        # Layout components
│   └── features/       # Feature-specific components
├── lib/                # Utility functions and libraries
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── services/           # API service functions
└── styles/             # Global styles
```

### 🔐 Security Rules

1. **NEVER** commit secrets atau API keys
2. **ALWAYS** use environment variables untuk sensitive data
3. **VALIDATE** all user inputs
4. **SANITIZE** data sebelum display
5. **USE** HTTPS untuk production

```typescript
// ❌ BAD
const API_KEY = "sk-12345678";

// ✅ GOOD
const API_KEY = process.env.API_KEY;
```

### 📦 Database & Prisma Rules

1. **ALWAYS** run migrations di development terlebih dahulu
2. **TEST** migrations di staging sebelum production
3. **BACKUP** database sebelum major migrations
4. **USE** transactions untuk operasi multiple tables

```bash
# Development workflow
npx prisma migrate dev --name descriptive_migration_name
npx prisma generate
npm run build
```

### 🚀 Deployment Rules

#### Pre-deployment Checklist:
- [ ] TypeScript check passed
- [ ] All tests passed
- [ ] Build successful
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Documentation updated

### 📝 Git Commit Rules

#### Commit Message Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, missing semicolons, etc)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

#### Examples:
```bash
# ✅ GOOD
git commit -m "feat(auth): add WhatsApp OTP verification"
git commit -m "fix(cart): resolve calculation error for discounts"
git commit -m "docs: update API documentation for v2 endpoints"

# ❌ BAD
git commit -m "update code"
git commit -m "fix"
```

### 🧪 Testing Rules

1. **WRITE** tests untuk semua new features
2. **MAINTAIN** minimum 70% code coverage
3. **TEST** edge cases dan error scenarios
4. **USE** meaningful test descriptions

```typescript
// ✅ GOOD Test Example
describe('WhatsApp Checkout', () => {
  it('should generate correct WhatsApp message with order details', () => {
    // Test implementation
  });

  it('should validate customer information before checkout', () => {
    // Test implementation
  });
});
```

### 🎯 Performance Rules

1. **OPTIMIZE** images (use next/image)
2. **IMPLEMENT** lazy loading untuk heavy components
3. **USE** React.memo untuk expensive components
4. **MINIMIZE** bundle size
5. **CACHE** API responses when appropriate

### 📱 Responsive Design Rules

1. **MOBILE FIRST** approach
2. **TEST** on multiple screen sizes
3. **USE** Tailwind responsive utilities
4. **ENSURE** touch-friendly interfaces

### 🔄 State Management Rules

1. **USE** Zustand untuk global state
2. **KEEP** state as local as possible
3. **AVOID** prop drilling
4. **USE** React Query untuk server state

### 📊 Monitoring & Logging

1. **LOG** all errors to monitoring service
2. **TRACK** performance metrics
3. **MONITOR** API response times
4. **SET UP** alerts untuk critical errors

---

## 🚫 PROHIBITED PRACTICES

### ❌ NEVER DO THIS:

1. **NEVER** push directly ke production tanpa testing
2. **NEVER** commit `node_modules` atau `.env` files
3. **NEVER** use `console.log` di production code
4. **NEVER** ignore TypeScript errors dengan `@ts-ignore`
5. **NEVER** store sensitive data di localStorage
6. **NEVER** hardcode URLs atau API endpoints
7. **NEVER** skip pre-push checks

---

## 📋 Pre-Push Script

Tambahkan ke `package.json`:

```json
{
  "scripts": {
    "pre-push": "npm run type-check && npm run lint && npm run test && npm run build",
    "type-check": "tsc --noEmit"
  }
}
```

Atau gunakan git hook:

```bash
# .husky/pre-push
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Running TypeScript check..."
npx tsc --noEmit

if [ $? -ne 0 ]; then
  echo "❌ TypeScript check failed. Please fix errors before pushing."
  exit 1
fi

echo "✅ TypeScript check passed!"

echo "🧪 Running tests..."
npm test

if [ $? -ne 0 ]; then
  echo "❌ Tests failed. Please fix before pushing."
  exit 1
fi

echo "✅ All checks passed! Pushing to remote..."
```

---

## 🎯 Quality Metrics Target

- **TypeScript Coverage**: 100% (no any types)
- **Test Coverage**: Minimum 70%
- **Build Time**: < 2 minutes
- **Bundle Size**: < 500KB initial load
- **Lighthouse Score**: > 90 for all metrics

---

## 📞 Support & Questions

Jika ada pertanyaan tentang rules ini:
1. Check existing documentation
2. Ask di team channel
3. Create GitHub issue untuk clarification

---

**⚡ Remember**: Quality > Speed. Better to push clean code tomorrow than broken code today!

**Last Updated**: December 2024
**Version**: 1.0.0