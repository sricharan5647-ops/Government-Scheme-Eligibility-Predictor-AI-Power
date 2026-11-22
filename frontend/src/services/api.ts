import {
  Scheme,
  CitizenProfile,
  EvaluationResponse,
  AssistantQuery,
  AssistantResponse,
  AdminStats,
  AuditLog
} from '../types';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('schemesathi_admin_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Public Schemes
  async getSchemes(params?: {
    q?: string;
    category?: string;
    government_level?: string;
    state_code?: string;
    beneficiary_group?: string;
  }): Promise<Scheme[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);
    if (params?.government_level) query.append('government_level', params.government_level);
    if (params?.state_code) query.append('state_code', params.state_code);
    if (params?.beneficiary_group) query.append('beneficiary_group', params.beneficiary_group);

    const res = await fetch(`${API_BASE}/schemes?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to load schemes catalogue');
    return res.json();
  },

  async getScheme(slugOrId: string): Promise<Scheme> {
    const res = await fetch(`${API_BASE}/schemes/${slugOrId}`);
    if (!res.ok) throw new Error('Failed to load scheme details');
    return res.json();
  },

  async getCategories(): Promise<{ id: string; name: string; count: number }[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) return [];
    return res.json();
  },

  async getMetadata(): Promise<any> {
    const res = await fetch(`${API_BASE}/metadata`);
    if (!res.ok) return {};
    return res.json();
  },

  // Deterministic Eligibility Evaluation
  async evaluateEligibility(profile: CitizenProfile): Promise<EvaluationResponse> {
    const res = await fetch(`${API_BASE}/eligibility/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to evaluate eligibility');
    return res.json();
  },

  // Grounded Assistant
  async askAssistant(query: AssistantQuery): Promise<AssistantResponse> {
    const res = await fetch(`${API_BASE}/assistant/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query)
    });
    if (!res.ok) throw new Error('Failed to obtain assistant response');
    return res.json();
  },

  // Public Citizen Feedback
  async submitFeedback(data: { scheme_id?: number; feedback_type: string; message: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to submit feedback');
    return res.json();
  },

  // Admin Auth
  async adminLogin(data: { email: string; password: string }): Promise<{ access_token: string; role: string; email: string }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Authentication failed. Please check credentials.');
    }
    return res.json();
  },

  // Admin Scheme Management
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async getAdminSchemes(params?: { status?: string; q?: string; category?: string }): Promise<Scheme[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.q) query.append('q', params.q);
    if (params?.category) query.append('category', params.category);

    const res = await fetch(`${API_BASE}/admin/schemes?${query.toString()}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch admin schemes');
    return res.json();
  },

  async getAdminScheme(id: number): Promise<Scheme> {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch scheme');
    return res.json();
  },

  async createScheme(data: any): Promise<Scheme> {
    const res = await fetch(`${API_BASE}/admin/schemes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create scheme');
    }
    return res.json();
  },

  async updateScheme(id: number, data: any): Promise<Scheme> {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update scheme');
    }
    return res.json();
  },

  async publishScheme(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}/publish`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to publish scheme');
    return res.json();
  },

  async archiveScheme(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}/archive`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to archive scheme');
    return res.json();
  },

  async deleteScheme(id: number): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/schemes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete scheme');
    return res.json();
  },

  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs?limit=${limit}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  async getAdminFeedback(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/feedback`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch feedback list');
    return res.json();
  }
};
