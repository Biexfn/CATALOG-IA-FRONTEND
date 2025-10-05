// ============================================
// TYPES DE AUTENTICAÇÃO
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// ============================================
// TYPES DE CATÁLOGOS
// ============================================

export type CatalogStatus = 'pending' | 'extracting' | 'analyzing' | 'completed' | 'paused' | 'failed';

export interface Catalog {
  id: string;
  user_id: string;
  name: string;
  file_name: string;
  file_type: string;
  file_url: string;
  status: CatalogStatus;
  tax_rate: number;
  extra_costs: number;
  total_products: number;
  products_extracted: number;
  products_analyzed: number;
  progress_percentage: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CatalogUploadParams {
  file: File;
  tax_rate: number;
  extra_costs: number;
  ml_links?: string[];
}

export interface CatalogLog {
  id: string;
  catalog_id: string;
  level: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

// ============================================
// TYPES DE PRODUTOS
// ============================================

export type ProductStatus = 'pending' | 'analyzing' | 'completed' | 'failed';
export type Recommendation = 'buy' | 'observe' | 'discard';
export type CompetitionLevel = 'low' | 'medium' | 'high';

export interface Product {
  id: string;
  catalog_id: string;
  sku: string;
  name: string;
  brand?: string;
  supplier_cost: number;
  ml_link?: string;
  status: ProductStatus;
  market_price?: number;
  suggested_price?: number;
  net_margin?: number;
  roi?: number;
  competition_level?: CompetitionLevel;
  recommendation?: Recommendation;
  ai_justification?: string;
  ml_data?: Record<string, unknown>;
  is_favorite: boolean;
  analyzed_at?: string;
  created_at: string;
}

export interface ProductFilters {
  catalog_id?: string;
  search?: string;
  recommendation?: Recommendation;
  competition_level?: CompetitionLevel;
  favorites_only?: boolean;
  min_margin?: number;
  max_margin?: number;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

// ============================================
// TYPES DE ASSINATURAS
// ============================================

export type SubscriptionPlan = 'trial' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'inactive' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  catalogs_limit: number;
  products_per_catalog_limit: number;
  catalogs_used_this_month: number;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  trial_days?: number;
  catalogs_limit: number | 'unlimited';
  products_limit: number | 'unlimited';
  features: string[];
}

export interface UsageStats {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  catalogs_used: number;
  catalogs_limit: number | 'unlimited';
  products_per_catalog_limit: number | 'unlimited';
  current_period_end?: string;
}

// ============================================
// TYPES DE RELATÓRIOS E ESTATÍSTICAS
// ============================================

export interface DashboardStats {
  total_catalogs: number;
  total_products: number;
  opportunities: number;
  average_margin: number;
  active_analyses: number;
  recent_catalogs: RecentCatalog[];
}

export interface RecentCatalog {
  id: string;
  name: string;
  status: CatalogStatus;
  total_products: number;
  products_analyzed: number;
  progress_percentage: number;
  created_at: string;
}

export interface ReportStats {
  total_products: number;
  opportunities: number;
  average_margin: number;
  competition_distribution: Array<{
    level: CompetitionLevel;
    count: number;
  }>;
  margin_distribution: Array<{
    range: string;
    count: number;
  }>;
  high_potential_products: Product[];
}

// ============================================
// TYPES DE ANÁLISE DE LINKS
// ============================================

export interface LinkAnalysisResult {
  link: string;
  product_name: string;
  cost: number;
  market_price: number;
  suggested_price: number;
  net_margin: number;
  roi: number;
  competition_level: CompetitionLevel;
  recommendation: Recommendation;
  ai_justification: string;
}

// ============================================
// TYPES DE API
// ============================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}