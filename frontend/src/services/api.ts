import { Complaint, ComplaintFilters, OfficerStats, SatisfactionStats, User } from '../types';
const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

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
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getMe(): Promise<{ success: boolean; user?: User; message?: string }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
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
    const res = await fetch(`${API_BASE}/complaints/duplicates?${params.toString()}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getMyComplaints(): Promise<{ success: boolean; count: number; complaints: Complaint[] }> {
    const res = await fetch(`${API_BASE}/complaints/mine`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async getComplaintById(id: string): Promise<{ success: boolean; complaint: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      headers: getAuthHeaders()
    });
    return res.json();
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
    const res = await fetch(`${API_BASE}/complaints/${id}/upvote`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateComplaintStatus(
    id: string,
    status: string,
    officerRemark?: string
  ): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, officerRemark })
    });
    return res.json();
  },

  async submitFeedback(
    id: string,
    rating: number,
    comment: string = ''
  ): Promise<{ success: boolean; message: string; complaint?: Complaint }> {
    const res = await fetch(`${API_BASE}/complaints/${id}/feedback`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ feedbackRating: rating, feedbackComment: comment })
    });
    return res.json();
  },

  async deleteComplaint(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/complaints/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Officer AI & Analytics
  async getOfficerSummary(): Promise<{
    success: boolean;
    summary: string;
    isAiGenerated: boolean;
    generatedAt: string;
    stats: OfficerStats;
  }> {
    const res = await fetch(`${API_BASE}/ai/officer-summary`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return res.json();
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
    const res = await fetch(`${API_BASE}/complaints/stats/satisfaction`, {
      headers: getAuthHeaders()
    });
    return res.json();
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
