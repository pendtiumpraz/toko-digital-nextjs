# DashboardLayout Component

A comprehensive layout component for store owners' dashboard pages that provides consistent navigation, user management, and responsive design.

## Features

- **Responsive Design**: Mobile-first approach with collapsible sidebar
- **Store Owner Navigation**: Menu items tailored for e-commerce store management
- **User Information Display**: Shows logged-in user details and store information
- **Notifications**: Bell icon with notification count badge
- **Logout Functionality**: Secure logout with API integration
- **Breadcrumb Navigation**: Context-aware breadcrumbs
- **Mobile Bottom Navigation**: Quick access to key features on mobile
- **Consistent Styling**: Matches AdminLayout design patterns

## Menu Items

The sidebar includes the following navigation items:

1. **Dashboard** (`/dashboard`) - Main overview page
2. **Products** (`/dashboard/products`) - Product management
3. **Orders** (`/dashboard/orders`) - Order processing and tracking
4. **Customers** (`/dashboard/customers`) - Customer management
5. **Financial** (`/dashboard/financial`) - Financial reports and transactions
6. **Analytics** (`/dashboard/analytics`) - Business analytics and insights
7. **Settings** (`/dashboard/settings`) - Store configuration
8. **Profile** (`/dashboard/profile`) - User profile management

## Usage

### Basic Implementation

```tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function YourPage() {
  return (
    <DashboardLayout>
      <div>Your page content goes here</div>
    </DashboardLayout>
  );
}
```

### Dashboard Home Page Example

```tsx
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function Dashboard() {
  return (
    <DashboardLayout>
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Welcome to Your Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Your stats cards */}
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your charts and tables */}
      </div>
    </DashboardLayout>
  );
}
```

## Props

The component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `React.ReactNode` | Yes | The content to be rendered inside the layout |

## Responsive Features

### Desktop (lg+)
- Fixed sidebar with full navigation
- Top header with breadcrumbs
- Main content area with proper spacing

### Tablet (md)
- Collapsible sidebar with overlay
- Hamburger menu toggle
- Optimized spacing and layout

### Mobile (sm and below)
- Hidden sidebar by default
- Mobile hamburger menu
- Bottom navigation bar for quick access
- Touch-optimized interactions

## User Authentication

The component automatically handles:

- User data retrieval from localStorage
- Display of user name, email, and store information
- Store status indicators (Active/Trial)
- Secure logout functionality
- Automatic redirection to login page on logout

## Notifications

- Bell icon in header shows notification count
- Red badge displays number of unread notifications
- Supports notification types: warning, success, info
- Currently shows mock data (replace with real API)

## State Management

The component manages the following internal state:

- `isSidebarOpen`: Controls mobile sidebar visibility
- `isLoading`: Loading state for logout operation
- `user`: Current user information and store data
- `notifications`: Notification count (configurable)

## Styling

- Uses Tailwind CSS for styling
- Gradient background from blue to indigo
- Framer Motion animations for smooth transitions
- Consistent with AdminLayout design patterns
- Hover effects and focus states for accessibility

## Integration with Existing Pages

To integrate with existing dashboard pages:

1. Import the DashboardLayout component
2. Wrap your page content with `<DashboardLayout>`
3. Remove any existing layout/header components
4. Adjust content styling if needed

Example migration:

```tsx
// Before
export default function ProductsPage() {
  return (
    <div className="p-6">
      <header>...</header>
      <main>Your content</main>
    </div>
  );
}

// After
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <main>Your content</main>
    </DashboardLayout>
  );
}
```

## API Dependencies

The component expects the following API endpoints:

- `POST /api/auth/logout` - For user logout functionality

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Responsive design works on all screen sizes

## Accessibility

- Keyboard navigation support
- ARIA labels for screen readers
- Focus management for modals and overlays
- High contrast ratios for text and backgrounds