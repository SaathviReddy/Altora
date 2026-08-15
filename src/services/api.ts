// Altora Production API Service Layer
// Connects to FastAPI Backend at http://localhost:8000/api/v1
// Supports HTTP REST endpoints + Real-time WebSockets

export interface User {
  email: string;
  name: string;
  businessName?: string;
  hasOnboarded: boolean;
}

export interface BusinessProfile {
  stage: 'no_idea' | 'idea' | 'business';
  industry: string;
  interests?: string[];
  skills?: string[];
  budget?: string;
  location?: string;
  availableTime?: string;
  onlinePreference?: 'online' | 'offline' | 'hybrid';
  soloPreference?: 'solo' | 'team';
  investmentCapacity?: number;
  currentChallenges?: string[];
  goals?: string[];
  revenue?: number;
  expenses?: number;
  details?: string;
}

export interface SWOT {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface AdvisorReport {
  id: string;
  createdAt: string;
  title: string;
  assessmentScore: number;
  explanation: string;
  targetCustomer: string;
  marketOpportunity: string;
  competition: string;
  revenueModel: string;
  pricing: string;
  costs: string;
  swot: SWOT;
  roadmap: { phase: string; title: string; tasks: string[] }[];
  risks: { risk: string; impact: 'High' | 'Medium' | 'Low'; mitigation: string }[];
  nextActions: string[];
  pdfUrl?: string;
  structuredData?: any;
}

export interface Memory {
  id: string;
  title: string;
  category: 'Business' | 'Ideas' | 'Goals' | 'Decisions' | 'Finance' | 'Tasks' | 'Milestones' | 'Advisor Reports' | 'Conversations';
  content: string;
  timestamp: string;
  relatedContext?: string;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense' | 'investment';
  amount: number;
  category: string;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  date: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
}

export interface ChatMessage {
  id?: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Token helpers
const getToken = (): string | null => localStorage.getItem('altora_token');
const setToken = (token: string): void => localStorage.setItem('altora_token', token);
const removeToken = (): void => {
  localStorage.removeItem('altora_token');
  localStorage.removeItem('altora_user');
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (res.status === 401) {
      removeToken();
    }

    const data = await res.json();
    if (!res.ok || data.success === false) {
      throw new Error(data?.error?.message || `HTTP Error ${res.status}`);
    }

    return data.data as T;
  } catch (err: any) {
    console.warn(`[API] Error on ${endpoint}:`, err.message || err);
    throw err;
  }
}

// WebSocket Connection Management
let wsConnection: WebSocket | null = null;
const eventSubscribers: Set<(event: any) => void> = new Set();

export function connectWebSocket() {
  const token = getToken();
  if (!token || (wsConnection && wsConnection.readyState === WebSocket.OPEN)) return;

  const wsUrl = BASE_URL.replace(/^http/, 'ws').replace(/\/api\/v1$/, '') + `/ws?token=${token}`;
  try {
    wsConnection = new WebSocket(wsUrl);

    wsConnection.onopen = () => {
      console.log('[WebSocket] Real-time stream connected.');
    };

    wsConnection.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        eventSubscribers.forEach((cb) => cb(payload));
      } catch (e) {
        console.error('[WebSocket] Invalid JSON message:', e);
      }
    };

    wsConnection.onclose = () => {
      console.log('[WebSocket] Connection closed. Reconnecting in 3s...');
      setTimeout(connectWebSocket, 3000);
    };
  } catch (err) {
    console.error('[WebSocket] Setup failed:', err);
  }
}

export function subscribeRealtimeEvents(callback: (event: any) => void) {
  eventSubscribers.add(callback);
  return () => {
    eventSubscribers.delete(callback);
  };
}

export const api = {
  auth: {
    async signup(email: string, name: string, businessName?: string): Promise<User> {
      const res = await request<{ token: string; user: User }>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, name, businessName, password: 'password123' })
      });
      setToken(res.token);
      localStorage.setItem('altora_user', JSON.stringify(res.user));
      connectWebSocket();
      return res.user;
    },

    async login(email: string): Promise<User> {
      const res = await request<{ token: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password: 'password123' })
      });
      setToken(res.token);
      localStorage.setItem('altora_user', JSON.stringify(res.user));
      connectWebSocket();
      return res.user;
    },

    async logout(): Promise<void> {
      removeToken();
      if (wsConnection) {
        wsConnection.close();
        wsConnection = null;
      }
    },

    async getMe(): Promise<User | null> {
      const token = getToken();
      if (!token) return null;

      try {
        const user = await request<User>('/auth/me');
        localStorage.setItem('altora_user', JSON.stringify(user));
        connectWebSocket();
        return user;
      } catch {
        return null;
      }
    }
  },

  business: {
    async getProfile(): Promise<BusinessProfile | null> {
      return request<BusinessProfile | null>('/business/profile');
    },

    async saveOnboarding(profile: BusinessProfile): Promise<BusinessProfile> {
      return request<BusinessProfile>('/business/onboarding', {
        method: 'POST',
        body: JSON.stringify(profile)
      });
    },

    async updateProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
      return request<BusinessProfile>('/business/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
    }
  },

  advisor: {
    async getReports(): Promise<AdvisorReport[]> {
      return request<AdvisorReport[]>('/advisor/reports');
    },

    async queryAdvisor(query: string): Promise<AdvisorReport> {
      return request<AdvisorReport>('/advisor/query', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
    },

    async generatePDFReport(query: string): Promise<AdvisorReport> {
      return request<AdvisorReport>('/advisor/report', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
    },

    getReportPDFUrl(reportId: string): string {
      const token = getToken();
      return `http://localhost:8000/api/v1/advisor/reports/${reportId}/pdf?token=${encodeURIComponent(token || '')}`;
    },

    async generateReport(): Promise<AdvisorReport> {
      return request<AdvisorReport>('/advisor/generate', {
        method: 'POST'
      });
    },

    generateMockReport(profile: BusinessProfile): AdvisorReport {
      const score = profile.stage === 'no_idea' ? 45 : profile.stage === 'idea' ? 68 : 82;
      return {
        id: `rep_${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: `Strategic Opportunity Report — ${profile.industry || 'Business Incubator'}`,
        assessmentScore: score,
        explanation: profile.stage === 'no_idea' 
          ? `Analysis of interests and industry matches. Based on your skill parameters and target budget, we have mapped a service-oriented agency structure.`
          : `Market validation blueprint for your business concept. Competitor analysis reveals high margin potential with moderate acquisition friction.`,
        targetCustomer: profile.stage === 'no_idea' 
          ? 'B2B small business owners seeking operations consultation' 
          : 'High-earning executives looking for fractional brand design',
        marketOpportunity: 'Estimated TAM of $4.2B in Tier 1 cities, driven by digital brand transition requirements post-2025.',
        competition: 'Highly fragmented local boutique consultancies. Differentiator lies in custom AI workflow integrations.',
        revenueModel: 'Fixed-term strategy engagements ($2,500 - $5,000) transitioning to retainer contracts ($1,500/mo).',
        pricing: '$3,500 setup strategy retainer + $1,500 maintenance fee.',
        costs: 'Principal contractor hire, hosting, legal setup, branding.',
        swot: {
          strengths: ['Low initial capital expenditures', 'Highly specialized advisory skills', 'Agile delivery model'],
          weaknesses: ['Solo resource limitations', 'High dependencies on founder brand', 'Long sales cycles'],
          opportunities: ['AI automation integrations for clients', 'Underserved regional markets', 'High ticket corporate cohorts'],
          threats: ['Direct competition from remote agencies', 'Rapid tool evolution risk', 'Macro budget consolidations']
        },
        roadmap: [
          {
            phase: 'Phase 1: Validation',
            title: 'Customer Discovery & Sandbox',
            tasks: ['Conduct 10 stakeholder interviews', 'Setup landing page framework', 'Launch strategy draft newsletter']
          },
          {
            phase: 'Phase 2: Alpha Launch',
            title: 'Initial Pilot Deliverables',
            tasks: ['Close first 2 advisory retainers', 'Execute core SWOT mappings', 'Deploy client workspace template']
          },
          {
            phase: 'Phase 3: Operations & Scale',
            title: 'Process Automation',
            tasks: ['Hire virtual agency assistant', 'Launch targeted LinkedIn outreach', 'Document case study results']
          }
        ],
        risks: [
          { risk: 'Founder capacity bottleneck', impact: 'High', mitigation: 'Template standard documents and automate billing operations early.' },
          { risk: 'High client churn', impact: 'Medium', mitigation: 'Focus on 6-month minimum lock-ins with clear milestone deliverables.' }
        ],
        nextActions: [
          'Log your first equity investment in the Finance tracker.',
          'Add "Conduct 10 customer validation interviews" to Tasks.',
          'Define the milestone for "First paid customer pilot".'
        ]
      };
    },

    async saveToMemory(report: AdvisorReport): Promise<Memory> {
      return request<Memory>(`/advisor/reports/${report.id}/save-to-memory`, {
        method: 'POST'
      });
    }
  },

  memory: {
    async getMemories(category?: string, query?: string): Promise<Memory[]> {
      let url = '/memory';
      const params = new URLSearchParams();
      if (category && category !== 'All') params.append('category', category);
      if (query) params.append('q', query);
      if (params.toString()) url += `?${params.toString()}`;

      return request<Memory[]>(url);
    },

    async addMemory(category: Memory['category'], title: string, content: string, relatedContext?: string): Promise<Memory> {
      return request<Memory>('/memory', {
        method: 'POST',
        body: JSON.stringify({ category, title, content, relatedContext })
      });
    }
  },

  finance: {
    async getTransactions(): Promise<Transaction[]> {
      return request<Transaction[]>('/finance/transactions');
    },

    async getSummary(): Promise<{ investment: number; revenue: number; expenses: number; profit: number }> {
      return request<{ investment: number; revenue: number; expenses: number; profit: number }>('/finance/summary');
    },

    async addTransaction(amount: number, type: 'revenue' | 'expense' | 'investment', category: string, description: string): Promise<Transaction> {
      return request<Transaction>('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify({ amount, type, category, description })
      });
    }
  },

  inventory: {
    async getItems(): Promise<InventoryItem[]> {
      return request<InventoryItem[]>('/inventory');
    },

    async addItem(name: string, quantity: number, costPrice: number, sellingPrice: number): Promise<InventoryItem> {
      return request<InventoryItem>('/inventory', {
        method: 'POST',
        body: JSON.stringify({ name, quantity, costPrice, sellingPrice })
      });
    },

    async updateStock(id: string, newQty: number): Promise<InventoryItem> {
      return request<InventoryItem>(`/inventory/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ newQuantity: newQty })
      });
    }
  },

  milestones: {
    async getMilestones(): Promise<Milestone[]> {
      return request<Milestone[]>('/milestones');
    },

    async addMilestone(title: string, description: string, date: string): Promise<Milestone> {
      return request<Milestone>('/milestones', {
        method: 'POST',
        body: JSON.stringify({ title, description, date })
      });
    },

    async toggleMilestone(id: string): Promise<Milestone> {
      return request<Milestone>(`/milestones/${id}/toggle`, {
        method: 'PATCH'
      });
    }
  },

  tasks: {
    async getTasks(): Promise<Task[]> {
      return request<Task[]>('/tasks');
    },

    async addTask(title: string, dueDate: string): Promise<Task> {
      return request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify({ title, dueDate })
      });
    },

    async toggleTask(id: string): Promise<Task> {
      return request<Task>(`/tasks/${id}/toggle`, {
        method: 'PATCH'
      });
    }
  },

  chat: {
    async getMessages(): Promise<ChatMessage[]> {
      return request<ChatMessage[]>('/chat/messages');
    },

    async sendMessage(text: string): Promise<ChatMessage> {
      return request<ChatMessage>('/chat/messages', {
        method: 'POST',
        body: JSON.stringify({ text })
      });
    }
  }
};
