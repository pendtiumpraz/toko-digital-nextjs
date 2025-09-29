import type { NextRequest } from 'next/server'
import type {
  UserWithRelations,
  StoreWithRelations,
  ProductWithRelations,
  OrderWithRelations,
  CustomerWithRelations,
  FinancialTransactionWithRelations,
  DashboardStats,
  ChartsResponse,
  SuperAdminStats,
  SystemHealth,
  FinancialDashboardStats,
  AnalyticsSummary,
  AnalyticsData
} from './database'

// Authentication Types
export interface AuthenticatedUser {
  userId: string
  email: string
  role: string
  storeId?: string
}

export interface AuthToken {
  userId: string
  email: string
  role: string
  iat: number
  exp: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  success: boolean
  token?: string
  user?: {
    id: string
    email: string
    name: string
    role: string
    storeId?: string
  }
  error?: string
}

export interface RegisterRequest {
  email: string
  name: string
  password: string
  phone: string
  storeName: string
  subdomain: string
  whatsappNumber: string
}

export interface RegisterResponse {
  success: boolean
  message?: string
  error?: string
}

// API Context Types
export interface TenantContext {
  userId: string
  storeId: string
  user: AuthenticatedUser
}

export interface AdminContext {
  userId: string
  role: string
  user: AuthenticatedUser
}

// Middleware Types
export type AuthMiddleware = (
  request: NextRequest
) => Promise<AuthenticatedUser | null>

export type TenantMiddleware = (
  request: NextRequest,
  handler: (context: TenantContext) => Promise<Response>
) => Promise<Response>

export type AdminMiddleware = (
  request: NextRequest,
  handler: (context: AdminContext) => Promise<Response>
) => Promise<Response>

// API Response Types
export interface StandardApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  timestamp?: string
}

export interface PaginatedApiResponse<T> extends StandardApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: Record<string, unknown>
  timestamp: string
}

// Validation Types
export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

// Request Types
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface DateRangeParams {
  startDate?: string
  endDate?: string
}

export interface SearchParams {
  q?: string
  search?: string
}

// Dashboard API Types
export interface DashboardStatsRequest extends PaginationParams {
  period?: 'today' | 'week' | 'month' | 'year'
}

export interface DashboardStatsResponse extends StandardApiResponse<DashboardStats> {}

export interface DashboardChartsRequest {
  period?: 'week' | 'month' | 'quarter' | 'year'
  type?: 'all' | 'revenue' | 'orders' | 'products' | 'customers' | 'orderStatus'
}

export interface DashboardChartsResponse extends StandardApiResponse<ChartsResponse> {}

// Super Admin API Types
export interface SuperAdminStatsResponse extends StandardApiResponse<{
  stats: SuperAdminStats
  systemHealth: SystemHealth
}> {}

export interface UsersListRequest extends PaginationParams, SearchParams {
  role?: string
  isActive?: boolean
  trialStatus?: 'active' | 'expired' | 'ending_soon'
  hasStore?: boolean
  subscriptionStatus?: string
}

export interface UsersListResponse extends PaginatedApiResponse<UserWithRelations> {}

export interface StoresListRequest extends PaginationParams, SearchParams {
  isActive?: boolean
  isVerified?: boolean
  plan?: string
}

export interface StoresListResponse extends PaginatedApiResponse<StoreWithRelations> {}

// Products API Types
export interface ProductsListRequest extends PaginationParams, SearchParams {
  category?: string
  visibility?: string
  isActive?: boolean
  featured?: boolean
  lowStock?: boolean
  priceMin?: number
  priceMax?: number
}

export interface ProductsListResponse extends PaginatedApiResponse<ProductWithRelations> {}

export interface ProductCreateRequest {
  name: string
  description: string
  category: string
  price: number
  stock?: number
  [key: string]: unknown
}

export interface ProductCreateResponse extends StandardApiResponse<ProductWithRelations> {}

// Orders API Types
export interface OrdersListRequest extends PaginationParams, SearchParams, DateRangeParams {
  status?: string
  paymentStatus?: string
  paymentMethod?: string
  source?: string
  customerId?: string
}

export interface OrdersListResponse extends PaginatedApiResponse<OrderWithRelations> {}

export interface OrderCreateRequest {
  customerName: string
  customerPhone: string
  items: Array<{
    productId: string
    quantity: number
  }>
  [key: string]: unknown
}

export interface OrderCreateResponse extends StandardApiResponse<OrderWithRelations> {}

// Customers API Types
export interface CustomersListRequest extends PaginationParams, SearchParams, DateRangeParams {
  status?: string
  tags?: string[]
  minSpent?: number
  maxSpent?: number
}

export interface CustomersListResponse extends PaginatedApiResponse<CustomerWithRelations> {}

export interface CustomerCreateRequest {
  name: string
  phone: string
  email?: string
  [key: string]: unknown
}

export interface CustomerCreateResponse extends StandardApiResponse<CustomerWithRelations> {}

// Financial API Types
export interface FinancialDashboardResponse extends StandardApiResponse<FinancialDashboardStats> {}

export interface TransactionsListRequest extends PaginationParams, SearchParams, DateRangeParams {
  type?: 'INCOME' | 'EXPENSE'
  category?: string
  tags?: string[]
  amountMin?: number
  amountMax?: number
}

export interface TransactionsListResponse extends PaginatedApiResponse<FinancialTransactionWithRelations> {}

export interface TransactionCreateRequest {
  type: 'INCOME' | 'EXPENSE'
  category: string
  amount: number
  description: string
  reference?: string
  tags?: string[]
  transactionDate?: string
}

export interface TransactionCreateResponse extends StandardApiResponse<FinancialTransactionWithRelations> {}

// Analytics API Types
export interface AnalyticsRequest {
  action?: 'summary' | 'trend' | 'record'
  period?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'
  periods?: number
}

export interface AnalyticsSummaryResponse extends StandardApiResponse<AnalyticsSummary> {}

export interface AnalyticsTrendResponse extends StandardApiResponse<{
  data: AnalyticsData[]
  period: string
  numberOfPeriods: number
}> {}

export interface AnalyticsTrackRequest {
  storeId: string
  visitorId?: string
  page?: string
}

export interface AnalyticsTrackResponse extends StandardApiResponse<{
  message: string
}> {}

// Settings API Types
export interface WhatsAppSettingsRequest {
  isEnabled?: boolean
  phoneNumber?: string
  businessName?: string
  greetingMessage?: string
  orderConfirmationTemplate?: string
  awayMessage?: string
  businessHoursEnabled?: boolean
  businessHoursStart?: string
  businessHoursEnd?: string
  businessHoursTimezone?: string
  autoReplyEnabled?: boolean
  welcomeMessageEnabled?: boolean
}

export interface WhatsAppSettingsResponse extends StandardApiResponse<{
  id: string
  storeId: string
  isEnabled: boolean
  phoneNumber: string
  businessName: string
  [key: string]: unknown
}> {}

// Bulk Operations Types
export interface BulkOperation<T> {
  action: 'create' | 'update' | 'delete'
  data: T[]
}

export interface BulkOperationResult<T> {
  success: boolean
  processed: number
  failed: number
  results: Array<{
    success: boolean
    data?: T
    error?: string
  }>
}

export interface BulkProductsRequest extends BulkOperation<ProductCreateRequest> {}
export interface BulkProductsResponse extends StandardApiResponse<BulkOperationResult<ProductWithRelations>> {}

export interface BulkCustomersRequest extends BulkOperation<CustomerCreateRequest> {}
export interface BulkCustomersResponse extends StandardApiResponse<BulkOperationResult<CustomerWithRelations>> {}

// Export/Import Types
export interface ExportRequest {
  format: 'csv' | 'xlsx' | 'json'
  fields?: string[]
  filters?: Record<string, unknown>
}

export interface ExportResponse {
  success: boolean
  url?: string
  filename?: string
  error?: string
}

export interface ImportRequest {
  file: File
  mapping: Record<string, string>
  skipFirstRow?: boolean
  updateExisting?: boolean
}

export interface ImportResponse extends StandardApiResponse<{
  imported: number
  updated: number
  failed: number
  errors: Array<{
    row: number
    error: string
  }>
}> {}

// Webhook Types
export interface WebhookEvent {
  type: string
  data: Record<string, unknown>
  timestamp: string
  storeId: string
}

export interface WebhookRequest {
  url: string
  events: string[]
  secret?: string
  isActive?: boolean
}

export interface WebhookResponse extends StandardApiResponse<{
  id: string
  url: string
  events: string[]
  isActive: boolean
  createdAt: string
}> {}

// File Upload Types
export interface UploadRequest {
  file: File
  folder?: string
  public?: boolean
}

export interface UploadResponse extends StandardApiResponse<{
  url: string
  filename: string
  size: number
  type: string
}> {}

// Health Check Types
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  uptime: number
  version?: string
  services: Record<string, {
    status: 'healthy' | 'unhealthy'
    responseTime?: number
    error?: string
  }>
}