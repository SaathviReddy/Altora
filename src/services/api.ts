// Altora Frontend Rebuild Mock Service Layer
// Mimics a stateful production backend using localStorage.
// All components fetch from here to preserve data integrity and real-time state changes.

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

// Initial Data Generators
const DEFAULT_MEMORIES: Memory[] = [
  {
    id: 'm1',
    title: 'Business Established',
    category: 'Business',
    content: 'Officially launched operations for Altora strategy and branding advisory.',
    timestamp: '2026-08-01T10:00:00Z'
  },
  {
    id: 'm2',
    title: 'Advisory Session on Market Positioning',
    category: 'Advisor Reports',
    content: 'Determined target audience should skew premium luxury businesses willing to pay retainer model.',
    timestamp: '2026-08-05T14:30:00Z',
    relatedContext: 'Advisor Report #1'
  },
  {
    id: 'm3',
    title: 'Initial Capital Injection',
    category: 'Finance',
    content: 'Transferred $25,000 founder investment for operating capital.',
    timestamp: '2026-08-02T09:00:00Z'
  }
];

const DEFAULT_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2026-08-02', type: 'investment', amount: 25000, category: 'Equity', description: 'Founder Initial Capital' },
  { id: 't2', date: '2026-08-05', type: 'expense', amount: 1200, category: 'Software', description: 'Development Tools & Hosting' },
  { id: 't3', date: '2026-08-10', type: 'revenue', amount: 4800, category: 'Consulting', description: 'Verdant Craft Brand Strategy Phase 1' },
  { id: 't4', date: '2026-08-12', type: 'expense', amount: 650, category: 'Marketing', description: 'Premium Business Cards & Copywriting' }
];

const DEFAULT_INVENTORY: InventoryItem[] = [
  { id: 'i1', name: 'Premium Strategy Workbook (Print)', quantity: 45, costPrice: 15, sellingPrice: 45, status: 'in_stock' },
  { id: 'i2', name: 'Brand Positioning Cards Deck', quantity: 8, costPrice: 8, sellingPrice: 25, status: 'low_stock' },
  { id: 'i3', name: 'Digital Toolkit License (Annual)', quantity: 150, costPrice: 0, sellingPrice: 99, status: 'in_stock' },
  { id: 'i4', name: 'Printed Workshop Guidebook', quantity: 0, costPrice: 12, sellingPrice: 35, status: 'out_of_stock' }
];

const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'ms1', title: 'Business Structure Setup', description: 'Registered business name and established brand positioning blueprint.', date: '2026-08-01', completed: true },
  { id: 'ms2', title: 'First Consulting Sale', description: 'Secured first retainer client for strategy consulting.', date: '2026-08-10', completed: true },
  { id: 'ms3', title: 'Launch Strategic Website', description: 'Deploy main digital portal and strategy inquiry dashboard.', date: '2026-08-25', completed: false }
];

const DEFAULT_TASKS: Task[] = [
  { id: 'tsk1', title: 'Refine value proposition presentation', completed: true, dueDate: '2026-08-14' },
  { id: 'tsk2', title: 'Finalize pricing packages for strategy clients', completed: false, dueDate: '2026-08-18' },
  { id: 'tsk3', title: 'Send retainer agreement to Verdant Craft', completed: false, dueDate: '2026-08-15' },
  { id: 'tsk4', title: 'Publish editorial article on founder OS', completed: false, dueDate: '2026-08-22' }
];

// Helper functions for localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const api = {
  // Auth Api
  auth: {
    signup(email: string, name: string, businessName?: string): Promise<User> {
      return new Promise((resolve) => {
        const user: User = { email, name, businessName, hasOnboarded: false };
        setStorageItem('altora_user', user);
        // Clear old business profile on fresh signup
        localStorage.removeItem('altora_profile');
        resolve(user);
      });
    },

    login(email: string): Promise<User> {
      return new Promise((resolve, reject) => {
        const existing = getStorageItem<User | null>('altora_user', null);
        if (existing && existing.email === email) {
          resolve(existing);
        } else if (email) {
          // Auto create user if email is supplied to prevent blocking demo
          const user: User = { email, name: email.split('@')[0], hasOnboarded: true };
          setStorageItem('altora_user', user);
          // Set initial demo profile
          if (!localStorage.getItem('altora_profile')) {
            const profile: BusinessProfile = {
              stage: 'business',
              industry: 'Strategic Brand Consultancy',
              revenue: 4800,
              expenses: 1850,
              goals: ['Scale to 5 active retainers', 'Launch digital courses'],
              currentChallenges: ['Client acquisition scaling', 'Time management'],
              details: 'Altora Consulting is an agency focused on strategy, branding, and operations design for high-growth tech founders.'
            };
            setStorageItem('altora_profile', profile);
          }
          resolve(user);
        } else {
          reject(new Error('Invalid email credentials.'));
        }
      });
    },

    logout(): Promise<void> {
      return new Promise((resolve) => {
        localStorage.removeItem('altora_user');
        resolve();
      });
    },

    getMe(): Promise<User | null> {
      return new Promise((resolve) => {
        resolve(getStorageItem<User | null>('altora_user', null));
      });
    }
  },

  // Business Profile
  business: {
    getProfile(): Promise<BusinessProfile | null> {
      return new Promise((resolve) => {
        resolve(getStorageItem<BusinessProfile | null>('altora_profile', null));
      });
    },

    saveOnboarding(profile: BusinessProfile): Promise<BusinessProfile> {
      return new Promise((resolve) => {
        setStorageItem('altora_profile', profile);
        // Update user state
        const user = getStorageItem<User | null>('altora_user', null);
        if (user) {
          user.hasOnboarded = true;
          if (profile.stage === 'business') {
            user.businessName = 'My Consulting Firm';
          }
          setStorageItem('altora_user', user);
        }
        
        // Generate initial reports matching stage
        const reports = getStorageItem<AdvisorReport[]>('altora_reports', []);
        if (reports.length === 0) {
          const mockReport = api.advisor.generateMockReport(profile);
          reports.push(mockReport);
          setStorageItem('altora_reports', reports);
        }

        resolve(profile);
      });
    },

    updateProfile(profile: Partial<BusinessProfile>): Promise<BusinessProfile> {
      return new Promise((resolve) => {
        const current = getStorageItem<BusinessProfile | null>('altora_profile', null) || {
          stage: 'business',
          industry: 'General'
        };
        const updated = { ...current, ...profile };
        setStorageItem('altora_profile', updated);
        resolve(updated);
      });
    }
  },

  // Advisor Reports
  advisor: {
    getReports(): Promise<AdvisorReport[]> {
      return new Promise((resolve) => {
        const reports = getStorageItem<AdvisorReport[]>('altora_reports', []);
        resolve(reports);
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

    saveToMemory(report: AdvisorReport): Promise<Memory> {
      return api.memory.addMemory(
        'Advisor Reports',
        `Saved Strategic Analysis: ${report.title}`,
        `Score: ${report.assessmentScore}%\nTarget customer: ${report.targetCustomer}\nRoadmap Steps: ${report.roadmap.map(r => r.title).join(' -> ')}`,
        report.id
      );
    }
  },

  // Memories
  memory: {
    getMemories(): Promise<Memory[]> {
      return new Promise((resolve) => {
        resolve(getStorageItem<Memory[]>('altora_memories', DEFAULT_MEMORIES));
      });
    },

    addMemory(category: Memory['category'], title: string, content: string, relatedContext?: string): Promise<Memory> {
      return new Promise((resolve) => {
        const memories = getStorageItem<Memory[]>('altora_memories', DEFAULT_MEMORIES);
        const newMemory: Memory = {
          id: `mem_${Date.now()}`,
          title,
          category,
          content,
          timestamp: new Date().toISOString(),
          relatedContext
        };
        memories.unshift(newMemory);
        setStorageItem('altora_memories', memories);
        resolve(newMemory);
      });
    }
  },

  // Finance Ledger
  finance: {
    getTransactions(): Promise<Transaction[]> {
      return new Promise((resolve) => {
        resolve(getStorageItem<Transaction[]>('altora_transactions', DEFAULT_TRANSACTIONS));
      });
    },

    getSummary(): Promise<{ investment: number; revenue: number; expenses: number; profit: number }> {
      return new Promise((resolve) => {
        const transactions = getStorageItem<Transaction[]>('altora_transactions', DEFAULT_TRANSACTIONS);
        let investment = 0;
        let revenue = 0;
        let expenses = 0;

        transactions.forEach((t) => {
          if (t.type === 'investment') investment += t.amount;
          else if (t.type === 'revenue') revenue += t.amount;
          else if (t.type === 'expense') expenses += t.amount;
        });

        resolve({
          investment,
          revenue,
          expenses,
          profit: revenue - expenses
        });
      });
    },

    addTransaction(amount: number, type: 'revenue' | 'expense' | 'investment', category: string, description: string): Promise<Transaction> {
      return new Promise((resolve) => {
        const transactions = getStorageItem<Transaction[]>('altora_transactions', DEFAULT_TRANSACTIONS);
        const newTx: Transaction = {
          id: `tx_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type,
          amount,
          category,
          description
        };
        transactions.unshift(newTx);
        setStorageItem('altora_transactions', transactions);

        // Auto log to memory
        api.memory.addMemory(
          'Finance',
          `Logged ${type}: $${amount.toLocaleString()}`,
          `${description} (${category})`
        );

        resolve(newTx);
      });
    }
  },

  // Inventory
  inventory: {
    getItems(): Promise<InventoryItem[]> {
      return new Promise((resolve) => {
        resolve(getStorageItem<InventoryItem[]>('altora_inventory', DEFAULT_INVENTORY));
      });
    },

    addItem(name: string, quantity: number, costPrice: number, sellingPrice: number): Promise<InventoryItem> {
      return new Promise((resolve) => {
        const items = getStorageItem<InventoryItem[]>('altora_inventory', DEFAULT_INVENTORY);
        const status = quantity === 0 ? 'out_of_stock' : quantity <= 10 ? 'low_stock' : 'in_stock';
        const newItem: InventoryItem = {
          id: `inv_${Date.now()}`,
          name,
          quantity,
          costPrice,
          sellingPrice,
          status
        };
        items.unshift(newItem);
        setStorageItem('altora_inventory', items);

        // Auto log to memory
        api.memory.addMemory(
          'Tasks',
          `Added Stock Item: ${name}`,
          `Registered ${quantity} units at selling price $${sellingPrice}.`
        );

        resolve(newItem);
      });
    },

    updateStock(id: string, newQty: number): Promise<InventoryItem> {
      return new Promise((resolve, reject) => {
        const items = getStorageItem<InventoryItem[]>('altora_inventory', DEFAULT_INVENTORY);
        const index = items.findIndex((i) => i.id === id);
        if (index !== -1) {
          const item = items[index];
          item.quantity = newQty;
          item.status = newQty === 0 ? 'out_of_stock' : newQty <= 10 ? 'low_stock' : 'in_stock';
          items[index] = item;
          setStorageItem('altora_inventory', items);
          resolve(item);
        } else {
          reject(new Error('Item not found'));
        }
      });
    }
  },

  // Milestones
  milestones: {
    getMilestones(): Promise<Milestone[]> {
      return new Promise((resolve) => {
        resolve(getStorageItem<Milestone[]>('altora_milestones', DEFAULT_MILESTONES));
      });
    },

    addMilestone(title: string, description: string, date: string): Promise<Milestone> {
      return new Promise((resolve) => {
        const milestones = getStorageItem<Milestone[]>('altora_milestones', DEFAULT_MILESTONES);
        const newMs: Milestone = {
          id: `ms_${Date.now()}`,
          title,
          description,
          date,
          completed: false
        };
        milestones.push(newMs);
        // Sort milestones by date ascending
        milestones.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setStorageItem('altora_milestones', milestones);

        api.memory.addMemory(
          'Milestones',
          `Scheduled Milestone: ${title}`,
          description
        );

        resolve(newMs);
      });
    },

    toggleMilestone(id: string): Promise<Milestone> {
      return new Promise((resolve, reject) => {
        const milestones = getStorageItem<Milestone[]>('altora_milestones', DEFAULT_MILESTONES);
        const index = milestones.findIndex((m) => m.id === id);
        if (index !== -1) {
          milestones[index].completed = !milestones[index].completed;
          setStorageItem('altora_milestones', milestones);

          if (milestones[index].completed) {
            api.memory.addMemory(
              'Milestones',
              `Completed Milestone: ${milestones[index].title}`,
              milestones[index].description
            );
          }

          resolve(milestones[index]);
        } else {
          reject(new Error('Milestone not found'));
        }
      });
    }
  },

  // Tasks
  tasks: {
    getTasks(): Promise<Task[]> {
      return new Promise((resolve) => {
        resolve(getStorageItem<Task[]>('altora_tasks', DEFAULT_TASKS));
      });
    },

    addTask(title: string, dueDate: string): Promise<Task> {
      return new Promise((resolve) => {
        const tasks = getStorageItem<Task[]>('altora_tasks', DEFAULT_TASKS);
        const newTask: Task = {
          id: `tsk_${Date.now()}`,
          title,
          completed: false,
          dueDate
        };
        tasks.unshift(newTask);
        setStorageItem('altora_tasks', tasks);
        resolve(newTask);
      });
    },

    toggleTask(id: string): Promise<Task> {
      return new Promise((resolve, reject) => {
        const tasks = getStorageItem<Task[]>('altora_tasks', DEFAULT_TASKS);
        const index = tasks.findIndex((t) => t.id === id);
        if (index !== -1) {
          tasks[index].completed = !tasks[index].completed;
          setStorageItem('altora_tasks', tasks);
          resolve(tasks[index]);
        } else {
          reject(new Error('Task not found'));
        }
      });
    }
  }
};
