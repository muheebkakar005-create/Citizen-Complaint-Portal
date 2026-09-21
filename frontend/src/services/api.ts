import { Complaint, ComplaintFilters, OfficerStats, SatisfactionStats, User } from '../types';

// Production backend URL (Vercel deployment).
// In development, Vite proxies /api/* to localhost:5000 (vite.config.ts),
// so import.meta.env.DEV detects dev mode and uses a relative path (no CORS).
// In production, always point to the deployed backend — either via an
function cleanBackendUrl(rawUrl?: string): string {
  if (!rawUrl) return 'https://citizen-complaint-portal-ruby.vercel.app';
  let cleaned = String(rawUrl)
    .trim()
    .replace(/^VITE_BACKEND_URL\s*=\s*/i, '')
    .replace(/^["']|["']$/g, '')
    .trim();
  const urlMatch = cleaned.match(/https?:\/\/[^\s"']+/);
  if (urlMatch) {
    cleaned = urlMatch[0];
  }
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = 'https://citizen-complaint-portal-ruby.vercel.app';
  }
  return cleaned.replace(/\/+$/, '');
}

const PROD_BACKEND = cleanBackendUrl(import.meta.env.VITE_BACKEND_URL);
const API_BASE = import.meta.env.DEV ? '/api' : `${PROD_BACKEND}/api`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

export const api = {
  // Auth
  async signup(data: { name: string; email: string; password: string; confirmPassword?: string }) {
    let res = await fetch(`${API_BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 404) {
      res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    let res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (res.status === 404) {
      res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    }
    return res.json();
  },

  async getMe(): Promise<{ success: boolean; user?: User; message?: string }> {
    let res = await fetch(`${API_BASE}/me`, {
      headers: getAuthHeaders()
    });
    if (res.status === 404) {
      res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
    }
    return res.json();
  },

  // Complaints
  async getComplaints(filters: ComplaintFilters = {}): Promise<{ success: boolean; count: number; complaints: Complaint[] }> {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.area && filters.area !== 'All') params.append('area', filters.area);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    if (filters.sort) params.append('sort', filters.sort);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/complaints${query}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async checkDuplicates(category: string, area: string): Promise<{ success: boolean; hasDuplicates: boolean; duplicates: Complaint[] }> {
    const params = new URLSearchParams({ category, area });
    try {
      const res = await fetch(`${API_BASE}/complaints/duplicates?${params.toString()}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?action=duplicates&${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return fallbackRes.json();
  },

  async getMyComplaints(): Promise<{ success: boolean; count: number; complaints: Complaint[] }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/mine`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?action=mine`, {
      headers: getAuthHeaders()
    });
    return fallbackRes.json();
  },

  async getComplaintById(id: string): Promise<{ success: boolean; complaint: Complaint }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.complaint) return data;
      }
    } catch {
      // Fall through to query fallback
    }

    // Guaranteed fallback using /api/complaints?id=...
    const fallbackRes = await fetch(`${API_BASE}/complaints?id=${encodeURIComponent(id)}`, {
      headers: getAuthHeaders()
    });
    return fallbackRes.json();
  },

  async createComplaint(data: {
    title: string;
    category: string;
    description: string;
    area: string;
    imageUrl?: string;
  }): Promise<{ success: boolean; message: string; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async upvoteComplaint(id: string): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/upvote`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?id=${encodeURIComponent(id)}&action=upvote`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });
    return fallbackRes.json();
  },

  async updateComplaintStatus(
    id: string,
    status: string,
    officerRemark?: string
  ): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, officerRemark })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?id=${encodeURIComponent(id)}&action=status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, status, officerRemark })
    });
    return fallbackRes.json();
  },

  async submitFeedback(
    id: string,
    rating: number,
    comment: string = ''
  ): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ feedbackRating: rating, feedbackComment: comment })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?id=${encodeURIComponent(id)}&action=feedback`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, feedbackRating: rating, feedbackComment: comment })
    });
    return fallbackRes.json();
  },

  async deleteComplaint(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id })
    });
    return fallbackRes.json();
  },

  // Officer AI & Analytics
  async getOfficerSummary(): Promise<{
    success: boolean;
    summary: string;
    isAiGenerated: boolean;
    generatedAt: string;
    stats: OfficerStats;
  }> {
    try {
      const res = await fetch(`${API_BASE}/ai/officer-summary`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/ai/briefing`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return fallbackRes.json();
  },

  async getComplaintSummary(id: string): Promise<{
    success: boolean;
    summary: string;
    isAiGenerated: boolean;
    generatedAt: string;
    message?: string;
  }> {
    try {
      const res = await fetch(`${API_BASE}/ai/complaints/${id}/summary`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/ai/summary?id=${encodeURIComponent(id)}`, {
      headers: getAuthHeaders()
    });
    return fallbackRes.json();
  },

  async getSatisfactionStats(): Promise<{
    success: boolean;
    averageSatisfaction: number;
    totalResponses: number;
    positiveFeedback: number;
    negativeFeedback: number;
    neutralFeedback: number;
    lowRatedComplaints: SatisfactionStats['lowRatedComplaints'];
  }> {
    try {
      const res = await fetch(`${API_BASE}/complaints/stats/satisfaction`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) return data;
      }
    } catch {
      // Fall through
    }

    const fallbackRes = await fetch(`${API_BASE}/complaints?action=satisfaction`, {
      headers: getAuthHeaders()
    });
    return fallbackRes.json();
  },

  getExportUrl(filters: ComplaintFilters = {}): string {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.area && filters.area !== 'All') params.append('area', filters.area);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
    return `${API_BASE}/complaints/export?${params.toString()}`;
  }
};
