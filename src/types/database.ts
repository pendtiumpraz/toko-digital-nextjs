import type {
  User,
  Store,
  Product,
  Order,
  OrderItem,
  Customer,
  FinancialTransaction,
  RecurringTransaction,
  StoreAnalytics,
  AdminActivityLog,
  SystemNotification,
  Subscription,
  Chat,
  ChatMessage,
  WhatsAppSettings,
  ProductImage,
  ProductVideo,
  ProductTag,
  Role,
  Currency,
  Layout,
  Category,
  WeightUnit,
  DimensionUnit,
  Visibility,
  ImageSource,
  VideoSource,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  OrderSource,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  ChatStatus,
  Priority,
  SenderType,
  TransactionType,
  TransactionCategory,
  RecurrenceFrequency,
  AdminAction,
  AnalyticsPeriod,
  NotificationType,
  CustomerStatus,
  Gender,
  Prisma
} from '@prisma/client'

// Extended types with relations
export interface UserWithRelations extends User {
  store?: StoreWithRelations
  subscription?: SubscriptionWithRelations
  chats?: ChatWithRelations[]
  adminActivities?: AdminActivityLog[]
  notifications?: SystemNotification[]
}

export interface StoreWithRelations extends Store {
  owner: User
  products?: ProductWithRelations[]
  orders?: OrderWithRelations[]
  customers?: CustomerWithRelations[]
  chats?: ChatWithRelations[]
  subscription?: SubscriptionWithRelations
  financialTransactions?: FinancialTransactionWithRelations[]
  recurringTransactions?: RecurringTransaction[]
  analytics?: StoreAnalytics[]
  notifications?: SystemNotification[]
  whatsappSettings?: WhatsAppSettings
}

export interface ProductWithRelations extends Product {
  store: Store
  images?: ProductImage[]
  videos?: ProductVideo[]
  tags?: ProductTag[]
  orderItems?: OrderItemWithRelations[]
}

export interface OrderWithRelations extends Order {
  store: Store
  customer?: CustomerWithRelations
  items: OrderItemWithRelations[]
  financialTransactions?: FinancialTransactionWithRelations[]
}

export interface OrderItemWithRelations extends OrderItem {
  order: Order
  product: Product
}

export interface CustomerWithRelations extends Customer {
  store: Store
  orders?: OrderWithRelations[]
}

export interface FinancialTransactionWithRelations extends FinancialTransaction {
  store: Store
  order?: Order
}

export interface SubscriptionWithRelations extends Subscription {
  user: User
  store: Store
}

export interface ChatWithRelations extends Chat {
  store: Store
  user?: User
  messages?: ChatMessage[]
}

export interface AdminActivityLogWithRelations extends AdminActivityLog {
  admin: User
}

export interface SystemNotificationWithRelations extends SystemNotification {
  user?: User
  store?: Store
}

export interface StoreAnalyticsWithRelations extends StoreAnalytics {
  store: Store
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: StatMetric
  totalOrders: StatMetric
  totalCustomers: StatMetric
  conversionRate: StatMetric
  totalViews?: StatMetric
  uniqueVisitors?: StatMetric
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
  period: string
  dateRange: {
    start: string
    end: string
  }
}

export interface StatMetric {
  value: string
  change?: string
  trend?: 'up' | 'down'
  rawValue: number
}

export interface RecentOrder {
  id: string
  customer: string
  total: string
  status: string
  date: string
}

export interface TopProduct {
  name: string
  sold: number
  revenue: number
  stock: number
}

// Chart Types
export interface ChartData {
  labels: string[]
  datasets: ChartDataset[]
}

export interface ChartDataset {
  label?: string
  data: number[]
  borderColor?: string
  backgroundColor?: string | string[]
  tension?: number
  borderWidth?: number
}

export interface ChartsResponse {
  charts: {
    revenue?: ChartData
    orders?: ChartData
    topProducts?: ChartData
    customerSegments?: ChartData
    orderStatus?: ChartData
  }
  period: string
  dateRange: {
    start: string
    end: string
  }
}

// Financial Types
export interface FinancialSummary {
  totalIncome: number
  totalExpenses: number
  netProfit: number
  transactionCount: number
  period: {
    start: Date
    end: Date
  }
}

export interface CategoryBreakdown {
  category: TransactionCategory
  type: TransactionType
  total: number
  count: number
  percentage: number
}

export interface FinancialReport {
  summary: FinancialSummary
  categoryBreakdown: CategoryBreakdown[]
  monthlyTrends: MonthlyTrend[]
  topExpenseCategories: CategoryBreakdown[]
  topIncomeCategories: CategoryBreakdown[]
}

export interface MonthlyTrend {
  month: string
  income: number
  expenses: number
  profit: number
}

export interface FinancialDashboardStats {
  thisMonth: FinancialSummary
  lastMonth: FinancialSummary
  thisYear: FinancialSummary
  growth: {
    income: number
    expenses: number
    profit: number
  }
  recentTransactions: FinancialTransactionWithRelations[]
  topExpenseCategories: CategoryBreakdown[]
  topIncomeCategories: CategoryBreakdown[]
}

// Analytics Types
export interface AnalyticsData {
  date: Date
  period: AnalyticsPeriod
  totalOrders: number
  totalRevenue: number
  totalProfit: number
  avgOrderValue: number
  totalProducts: number
  activeProducts: number
  outOfStock: number
  totalViews: number
  uniqueVisitors: number
  conversionRate: number
  totalIncome: number
  totalExpenses: number
  netProfit: number
}

export interface AnalyticsSummary {
  current: AnalyticsData
  previous?: AnalyticsData
  growth: {
    revenue: number
    orders: number
    visitors: number
    conversionRate: number
    profit: number
  }
}

// Admin Types
export interface SuperAdminStats {
  users: {
    total: number
    active: number
    inactive: number
    newThisWeek: number
    newThisMonth: number
  }
  stores: {
    total: number
    active: number
    inactive: number
  }
  trials: {
    active: number
    expiringSoon: number
    expired: number
  }
  subscriptions: {
    active: number
    expired: number
  }
  revenue: {
    total: number
    thisMonth: number
  }
}

export interface SystemHealth {
  avgResponseTime: number
  errorRate: number
  storageUsage: number
  activeConnections: number
  status: 'healthy' | 'warning' | 'critical'
}

// Filter Types
export interface UserFilters {
  role?: Role
  isActive?: boolean
  trialStatus?: 'active' | 'expired' | 'ending_soon'
  search?: string
  hasStore?: boolean
  subscriptionStatus?: SubscriptionStatus
}

export interface OrderFilters {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  paymentMethod?: PaymentMethod
  source?: OrderSource
  dateFrom?: Date
  dateTo?: Date
  search?: string
  customerId?: string
}

export interface ProductFilters {
  category?: Category
  visibility?: Visibility
  isActive?: boolean
  featured?: boolean
  lowStock?: boolean
  search?: string
  priceMin?: number
  priceMax?: number
}

export interface CustomerFilters {
  status?: CustomerStatus
  search?: string
  tags?: string[]
  dateFrom?: Date
  dateTo?: Date
  minSpent?: number
  maxSpent?: number
}

export interface TransactionFilters {
  type?: TransactionType
  category?: TransactionCategory
  dateFrom?: Date
  dateTo?: Date
  search?: string
  tags?: string[]
  amountMin?: number
  amountMax?: number
}

// Form Data Types
export interface CreateUserData {
  email: string
  name: string
  password: string
  phone: string
  role?: Role
}

export interface CreateStoreData {
  name: string
  description?: string
  subdomain: string
  whatsappNumber: string
  email?: string
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  currency?: Currency
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  layout?: Layout
}

export interface CreateProductData {
  name: string
  description: string
  category: Category
  subCategory?: string
  price: number
  comparePrice?: number
  cost?: number
  sku?: string
  barcode?: string
  stock?: number
  trackInventory?: boolean
  lowStockAlert?: number
  weight?: number
  weightUnit?: WeightUnit
  length?: number
  width?: number
  height?: number
  dimensionUnit?: DimensionUnit
  slug: string
  metaTitle?: string
  metaDescription?: string
  visibility?: Visibility
  publishDate?: Date
  featured?: boolean
  isActive?: boolean
  images?: CreateProductImageData[]
  videos?: CreateProductVideoData[]
  tags?: string[]
}

export interface CreateProductImageData {
  url: string
  alt?: string
  isPrimary?: boolean
  source?: ImageSource
}

export interface CreateProductVideoData {
  url: string
  title?: string
  source?: VideoSource
  thumbnail?: string
}

export interface CreateOrderData {
  customerName: string
  customerEmail?: string
  customerPhone: string
  customerWhatsapp?: string
  shippingStreet?: string
  shippingCity?: string
  shippingState?: string
  shippingCountry?: string
  shippingPostalCode?: string
  shippingNotes?: string
  shipping?: number
  tax?: number
  discount?: number
  notes?: string
  paymentMethod?: PaymentMethod
  source?: OrderSource
  items: CreateOrderItemData[]
}

export interface CreateOrderItemData {
  productId: string
  quantity: number
  variant?: string
}

export interface CreateCustomerData {
  name: string
  email?: string
  phone: string
  whatsappNumber?: string
  street?: string
  city?: string
  state?: string
  country?: string
  postalCode?: string
  birthDate?: Date
  gender?: Gender
  notes?: string
  tags?: string[]
}

export interface CreateTransactionData {
  type: TransactionType
  category: TransactionCategory
  amount: number
  description: string
  reference?: string
  tags?: string[]
  transactionDate?: Date
}

// Update Data Types
export type UpdateUserData = Partial<Omit<CreateUserData, 'password'>> & {
  password?: string
}

export type UpdateStoreData = Partial<CreateStoreData>
export type UpdateProductData = Partial<CreateProductData>
export type UpdateOrderData = Partial<CreateOrderData>
export type UpdateCustomerData = Partial<CreateCustomerData>
export type UpdateTransactionData = Partial<CreateTransactionData>

// Database Query Types
export type UserWhereInput = Prisma.UserWhereInput
export type StoreWhereInput = Prisma.StoreWhereInput
export type ProductWhereInput = Prisma.ProductWhereInput
export type OrderWhereInput = Prisma.OrderWhereInput
export type CustomerWhereInput = Prisma.CustomerWhereInput
export type FinancialTransactionWhereInput = Prisma.FinancialTransactionWhereInput

export type UserOrderByInput = Prisma.UserOrderByWithRelationInput
export type StoreOrderByInput = Prisma.StoreOrderByWithRelationInput
export type ProductOrderByInput = Prisma.ProductOrderByWithRelationInput
export type OrderOrderByInput = Prisma.OrderOrderByWithRelationInput
export type CustomerOrderByInput = Prisma.CustomerOrderByWithRelationInput
export type FinancialTransactionOrderByInput = Prisma.FinancialTransactionOrderByWithRelationInput

// Export all Prisma types for convenience
export {
  Role,
  Currency,
  Layout,
  Category,
  WeightUnit,
  DimensionUnit,
  Visibility,
  ImageSource,
  VideoSource,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  OrderSource,
  SubscriptionPlan,
  SubscriptionStatus,
  BillingCycle,
  ChatStatus,
  Priority,
  SenderType,
  TransactionType,
  TransactionCategory,
  RecurrenceFrequency,
  AdminAction,
  AnalyticsPeriod,
  NotificationType,
  CustomerStatus,
  Gender
}