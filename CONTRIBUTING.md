# Contributing to Toko Digital SaaS

Thank you for your interest in contributing to Toko Digital! We welcome contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Community](#community)

## 📜 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Accept feedback gracefully
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL or access to Vercel Postgres
- Git
- A GitHub account

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
```bash
git clone https://github.com/YOUR-USERNAME/toko-digital-nextjs.git
cd toko-digital-nextjs
```

3. Add the upstream repository:
```bash
git remote add upstream https://github.com/pendtiumpraz/toko-digital-nextjs.git
```

4. Keep your fork up to date:
```bash
git fetch upstream
git checkout main
git merge upstream/main
```

## 💻 Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
JWT_SECRET=your-secret
NEXTAUTH_SECRET=your-nextauth-secret
```

### 3. Set Up Database

Run Prisma migrations:
```bash
npx prisma generate
npx prisma db push
```

Seed the database (optional):
```bash
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues. When creating a bug report, include:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Your environment (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- A clear and descriptive title
- Detailed description of the proposed feature
- Use cases and examples
- Mockups or wireframes (if applicable)

### Your First Code Contribution

1. Look for issues labeled `good first issue` or `help wanted`
2. Comment on the issue to let others know you're working on it
3. Ask questions if you need clarification

### Working on Features

1. Create a new branch:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our coding standards

3. Write or update tests

4. Update documentation

5. Commit your changes:
```bash
git commit -m "feat: add new feature"
```

## 📝 Pull Request Process

### Before Submitting

1. **Test your changes:**
```bash
npm run test
npm run test:e2e
```

2. **Lint your code:**
```bash
npm run lint
npm run lint:fix
```

3. **Build the project:**
```bash
npm run build
```

4. **Update documentation** if needed

### Submitting a Pull Request

1. Push to your fork:
```bash
git push origin feature/your-feature-name
```

2. Open a Pull Request on GitHub

3. Fill out the PR template:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
```

### After Submitting

- Respond to code review feedback
- Make requested changes
- Keep your PR up to date with the main branch

## 💅 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all props and API responses
- Avoid `any` type - use `unknown` if type is truly unknown
- Use strict mode

```typescript
// Good
interface UserProps {
  id: string
  name: string
  email: string
}

// Bad
const user: any = {...}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Extract reusable logic into custom hooks

```typescript
// Good
export default function ProductCard({ product }: { product: Product }) {
  // Component logic
}

// Bad
export default function ProductCard(props: any) {
  // Component logic
}
```

### File Structure

```
src/
├── app/              # Next.js app router pages
│   ├── api/         # API routes
│   └── (routes)/    # Page routes
├── components/       # Reusable components
│   ├── ui/          # UI components
│   └── features/    # Feature components
├── lib/             # Utility functions
├── hooks/           # Custom React hooks
├── types/           # TypeScript types
└── __tests__/       # Test files
```

### Naming Conventions

- **Files:** kebab-case for files (`user-profile.tsx`)
- **Components:** PascalCase (`UserProfile`)
- **Functions:** camelCase (`getUserData`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Interfaces:** PascalCase with 'I' prefix (`IUserProfile`)
- **Types:** PascalCase (`UserRole`)

### API Routes

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return consistent response format
- Handle errors gracefully
- Validate input data

```typescript
// Good API response format
export async function GET(request: NextRequest) {
  try {
    const data = await fetchData()
    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 })
  }
}
```

### Database Queries

- Use Prisma for all database operations
- Optimize queries with proper indexes
- Use transactions for related operations
- Handle database errors

```typescript
// Good
const user = await prisma.user.findUnique({
  where: { id },
  include: { store: true },
})

// Bad
const user = await prisma.$queryRaw`SELECT * FROM users WHERE id = ${id}`
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

### Writing Tests

#### Unit Tests

Place unit tests next to the code they test:
```
src/
├── components/
│   ├── ProductCard.tsx
│   └── ProductCard.test.tsx
```

Example test:
```typescript
import { render, screen } from '@testing-library/react'
import ProductCard from './ProductCard'

describe('ProductCard', () => {
  it('should render product name', () => {
    const product = {
      id: '1',
      name: 'Test Product',
      price: 100000,
    }

    render(<ProductCard product={product} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
  })
})
```

#### Integration Tests

Test API routes and database operations:
```typescript
describe('POST /api/products', () => {
  it('should create a product', async () => {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test Product',
        price: 100000,
      }),
    })

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
  })
})
```

### Test Coverage

We aim for at least 70% code coverage:
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

## 📚 Documentation

### Code Documentation

Use JSDoc comments for functions and complex logic:
```typescript
/**
 * Calculates the total price including tax and shipping
 * @param subtotal - The subtotal amount
 * @param tax - Tax percentage (0-100)
 * @param shipping - Shipping cost
 * @returns Total price
 */
function calculateTotal(
  subtotal: number,
  tax: number,
  shipping: number
): number {
  const taxAmount = subtotal * (tax / 100)
  return subtotal + taxAmount + shipping
}
```

### API Documentation

Update `docs/API.md` when adding or modifying endpoints:
```markdown
### Create Product
`POST /api/products`

**Request Body:**
```json
{
  "name": "Product Name",
  "price": 100000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "prod123",
    "name": "Product Name"
  }
}
```
```

### README Updates

Update README.md when:
- Adding new features
- Changing setup instructions
- Modifying environment variables
- Adding new dependencies

## 🎯 Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples
```bash
feat(auth): add social login with Google

fix(products): resolve stock calculation issue

docs: update API documentation for orders

test(api): add unit tests for product endpoints

chore: update dependencies
```

## 🔧 Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Prisma
- GitLens
- Thunder Client (API testing)

### VS Code Settings

`.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

## 🐛 Debugging

### Debug Next.js

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "port": 9229,
      "env": {
        "NODE_OPTIONS": "--inspect"
      }
    }
  ]
}
```

### Debug Tests

```json
{
  "name": "Jest: debug",
  "type": "node",
  "request": "launch",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test", "--", "--runInBand"],
  "console": "integratedTerminal"
}
```

## 🚢 Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create a release branch
4. Create a pull request
5. After review and merge, tag the release:
```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 📊 Performance Guidelines

### Optimization Checklist

- [ ] Use Next.js Image component for images
- [ ] Implement proper caching strategies
- [ ] Optimize database queries
- [ ] Use React.memo for expensive components
- [ ] Implement pagination for lists
- [ ] Use dynamic imports for large components
- [ ] Optimize bundle size

### Performance Targets

- Lighthouse Score: > 90
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle Size: < 500KB (initial)

## 🔒 Security Guidelines

### Security Checklist

- [ ] Never commit sensitive data
- [ ] Validate all user inputs
- [ ] Use parameterized queries
- [ ] Implement rate limiting
- [ ] Keep dependencies updated
- [ ] Use HTTPS in production
- [ ] Implement CSRF protection
- [ ] Sanitize HTML content

### Reporting Security Issues

**DO NOT** create public issues for security vulnerabilities. Instead, email security@toko-digital.com with:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## 🌐 Internationalization

When adding new UI strings:

1. Add to translation files:
```typescript
// locales/en.json
{
  "products": {
    "title": "Products",
    "addNew": "Add New Product"
  }
}
```

2. Use translation hook:
```typescript
import { useTranslation } from 'next-i18next'

function ProductList() {
  const { t } = useTranslation()

  return <h1>{t('products.title')}</h1>
}
```

## 📱 Accessibility

### Accessibility Checklist

- [ ] Use semantic HTML
- [ ] Add proper ARIA labels
- [ ] Ensure keyboard navigation
- [ ] Maintain color contrast ratios
- [ ] Add alt text for images
- [ ] Test with screen readers

### Testing Accessibility

```bash
# Run accessibility tests
npm run test:a11y

# Use axe DevTools extension in browser
```

## 🤔 Getting Help

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

### Community

- GitHub Issues: Bug reports and feature requests
- GitHub Discussions: General questions and discussions
- Email: support@toko-digital.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Acknowledgments

Thank you to all contributors who help make Toko Digital better!

---

**Happy Contributing! 🎉**