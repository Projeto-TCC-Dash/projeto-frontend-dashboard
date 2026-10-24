// ==========================================
// CATEGORIAS CANÔNICAS (11 Categorias Oficiais)
// ==========================================
export const CANONICAL_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Educação',
  'Receita',
  'Pagamento de Fatura',
  'Investimentos',
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

export const APP_ROUTES = {
  DASHBOARD: '/',
  ACCOUNTS: '/accounts',
  TRANSACTIONS: '/transactions',
  METAS: '/settings/metas',
  PROFILE: '/settings/profile',
  SECURITY: '/settings/security',
  EXPORT: '/settings/export',
  CHAT: '/chat',
} as const;

// ==========================================
// PERFIL FINANCEIRO DO USUÁRIO (ONBOARDING)
// ==========================================
export const INCOME_TYPES = [
  'CLT',
  'PJ_AUTONOMO',
  'PUBLIC_SERVANT',
  'ENTREPRENEUR',
  'STUDENT',
  'RETIRED',
  'OTHER',
] as const;
export type IncomeType = (typeof INCOME_TYPES)[number];

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  CLT: 'CLT (Carteira Assinada)',
  PJ_AUTONOMO: 'PJ / Autônomo / Freelancer',
  PUBLIC_SERVANT: 'Servidor Público',
  ENTREPRENEUR: 'Empresário / Sócio',
  STUDENT: 'Estudante / Estagiário',
  RETIRED: 'Aposentado / Pensionista',
  OTHER: 'Outro',
};

export const FINANCIAL_GOALS = [
  'RESERVA_EMERGENCIA',
  'QUITAR_DIVIDAS',
  'COMPRAR_IMOVEL',
  'INVESTIR_LONGO_PRAZO',
  'CONTROLE_GASTOS',
] as const;
export type FinancialGoal = (typeof FINANCIAL_GOALS)[number];

export const FINANCIAL_GOAL_LABELS: Record<FinancialGoal, string> = {
  RESERVA_EMERGENCIA: 'Criar / Expandir Reserva de Emergência',
  QUITAR_DIVIDAS: 'Quitar Dívidas e Empréstimos',
  COMPRAR_IMOVEL: 'Comprar Imóvel / Casa Própria',
  INVESTIR_LONGO_PRAZO: 'Investir para Longo Prazo / Independência',
  CONTROLE_GASTOS: 'Controlar Gastos Supérfluos e Orçamento',
};

export const RISK_PROFILES = [
  'CONSERVATIVE',
  'MODERATE',
  'AGGRESSIVE',
] as const;
export type RiskProfile = (typeof RISK_PROFILES)[number];

export const RISK_PROFILE_LABELS: Record<RiskProfile, string> = {
  CONSERVATIVE: 'Conservador (prioriza segurança e liquidez)',
  MODERATE: 'Moderado (equilíbrio entre segurança e rentabilidade)',
  AGGRESSIVE: 'Agressivo (foco em crescimento com tolerância à oscilação)',
};

export interface FinancialProfile {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
  updatedAt?: string;
}

export interface UserSecuritySettings {
  twoFactorEnabled: boolean;
  hasLocalPassword: boolean;
  googleLinked: boolean;
  googleEmail?: string;
  googleLinkedAt?: string;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string | null;
  hasAiKey: boolean;
  security?: UserSecuritySettings;
  financialProfile?: FinancialProfile;
  createdAt?: string;
}

export interface UpdateUserProfileDTO {
  name?: string;
}

export interface UnifiedIdentityDraft {
  name: string;
  pendingAvatarFile: File | null;
  pendingAvatarPreview: string | null;
  pendingAvatarRemove: boolean;
  isDirty: boolean;
  validationError?: string | null;
}

export interface UserProfileIdentityFormProps {
  initialName?: string;
  email: string;
  avatarUrl?: string | null;
  onSubmit: (payload: {
    name?: string;
    avatarFile?: File | null;
    removeAvatar?: boolean;
  }) => Promise<void>;
  isPending?: boolean;
}

export interface Request2FAResponse {
  message: string;
  expiresInSeconds: number;
}

export interface Confirm2FADTO {
  code: string;
}

export interface Disable2FADTO {
  password?: string;
  code?: string;
}

export interface TwoFactorActionResponse {
  success: boolean;
  message: string;
  twoFactorEnabled: boolean;
}

export interface UpdateFinancialProfileDTO {
  incomeType?: IncomeType;
  declaredMonthlyIncome?: number;
  goals?: FinancialGoal[];
  riskProfile?: RiskProfile;
}

// ==========================================
// TRANSAÇÕES
// ==========================================
export interface TransactionAccountSummary {
  id: string;
  name: string;
  color?: string;
  institution?: string;
}

export interface Transaction {
  id: string;
  externalId: string;
  rawDescription: string;
  cleanDescription: string;
  amount: number; // Positivo = Receita, Negativo = Despesa
  date: string; // ISO 8601 UTC
  category: Category;
  source: TransactionSource;
  accountId?: string;
  account?: TransactionAccountSummary;
}

export interface UploadTransactionsResponse {
  totalExtracted: number;
  imported: number;
  duplicatesIgnored: number;
}

export interface UpdateTransactionDTO {
  category?: Category;
  cleanDescription?: string;
  accountId?: string | null;
}

export interface TransactionFilterParams {
  month?: string;
  category?: Category;
  source?: TransactionSource;
  accountId?: string;
}

export const EXPORT_FORMATS = ['csv', 'xlsx', 'pdf'] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export interface ExportFilterParams {
  format: ExportFormat;
  month?: string;
  startDate?: string;
  endDate?: string;
  accountId?: string;
  category?: Category;
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
  invoiceSettlements?: number;
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

// ==========================================
// GESTÃO MULTICONTA E CARTÕES DE CRÉDITO (Feature 006)
// ==========================================
export const ACCOUNT_TYPES = [
  'CHECKING',
  'CREDIT_CARD',
  'INVESTMENT',
  'CASH',
  'OTHER',
] as const;

export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CHECKING: 'Conta Corrente',
  CREDIT_CARD: 'Cartão de Crédito',
  INVESTMENT: 'Investimentos',
  CASH: 'Dinheiro em Espécie',
  OTHER: 'Outras Contas',
};

export const ACCOUNT_TYPE_ICONS: Record<AccountType, string> = {
  CHECKING: 'Landmark',
  CREDIT_CARD: 'CreditCard',
  INVESTMENT: 'TrendingUp',
  CASH: 'Banknote',
  OTHER: 'Wallet',
};

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  initialBalance: number;
  institution?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountsOverview {
  accounts: Account[];
  netWorth: number;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  initialBalance?: number;
  institution?: string;
  color?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  initialBalance?: number;
  institution?: string;
  color?: string;
}

export interface DeleteAccountParams {
  id: string;
  cascade?: boolean;
}

