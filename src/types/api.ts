// ==========================================
// CATEGORIAS CANÔNICAS (9 Categorias Oficiais)
// ==========================================
export const CANONICAL_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Receita',
  'Outros',
  'Não Categorizado',
] as const;

export type Category = (typeof CANONICAL_CATEGORIES)[number];

export const TRANSACTION_SOURCES = ['OFX', 'CSV', 'SEED'] as const;
export type TransactionSource = (typeof TRANSACTION_SOURCES)[number];

// ==========================================
// AUTENTICAÇÃO E USUÁRIO
// ==========================================
export interface User {
  id: string;
  email: string;
  hasAiKey: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type AiKeyOperationalStatus =
  | 'NOT_CONFIGURED'
  | 'ACTIVE_VERIFIED'
  | 'ACTIVE_PROVISIONAL_DEMAND'
  | 'INVALID_OR_REVOKED';

export interface SetApiKeyResponse {
  success: boolean;
  message: string;
  status?: 'ACTIVE_VERIFIED' | 'ACTIVE_PROVISIONAL_DEMAND';
}

export interface AuthCredentialsDTO {
  email: string;
  password: string;
}

export interface SetAiKeyDTO {
  apiKey: string;
}

export interface AuthSession {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==========================================
// TRANSAÇÕES (Features Futuras)
// ==========================================
export interface Transaction {
  id: string;
  externalId: string;
  rawDescription: string;
  cleanDescription: string;
  amount: number; // Positivo = Receita, Negativo = Despesa
  date: string; // ISO 8601 UTC
  category: Category;
  source: TransactionSource;
}

export interface UploadTransactionsResponse {
  totalExtracted: number;
  imported: number;
  duplicatesIgnored: number;
}

export interface UpdateTransactionDTO {
  category?: Category;
  cleanDescription?: string;
}

export interface CategorizeResponse {
  uniqueMerchantsAnalyzed: number;
  transactionsUpdated: number;
}

// ==========================================
// ANÁLISE FINANCEIRA & DASHBOARD (Features Futuras)
// ==========================================
export interface CategoryMetric {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialMetrics {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  savingsRate: number; // Em percentual (ex: 35.5%)
  topCategories: CategoryMetric[];
}

export interface FinancialAnalysis {
  cached: boolean;
  month: string; // Formato 'YYYY-MM'
  diagnosis: string; // Parecer analítico em markdown
  recommendations: string[];
  metrics: FinancialMetrics;
  generatedAt: string;
  expiresAt: string;
}

// ==========================================
// CHATBOT ASSISTENTE (SSE - Feature Futura)
// ==========================================
export type ChatMessageStatus =
  | 'sending'
  | 'streaming'
  | 'complete'
  | 'interrupted'
  | 'error';

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp?: string;
  status?: ChatMessageStatus;
  error?: string;
}

export interface ChatStreamChunk {
  text?: string;
  done?: boolean;
  sessionId?: string;
  error?: string;
  code?: string;
  statusCode?: number;
}
