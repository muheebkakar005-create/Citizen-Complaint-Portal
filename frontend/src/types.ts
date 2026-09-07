export type UserRole = 'citizen' | 'officer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export type ComplaintCategory = 'Road' | 'Garbage' | 'Water' | 'Electricity' | 'Other';
export type ComplaintStatus = 'pending' | 'in-progress' | 'resolved';
export type PriorityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  area: string;
  status: ComplaintStatus;
  upvotes: number;
  upvotedBy: string[];
  imageUrl?: string;
  createdBy: string;
  creatorName?: string;
  creatorEmail?: string;
  officerRemark?: string;
  createdAt: string;
  updatedAt: string;
  feedbackRating?: number;
  feedbackComment?: string;
  feedbackGiven: boolean;
  feedbackPending: boolean;
  priorityScore: number;
  priority: PriorityLevel;
}

export interface ComplaintFilters {
  search?: string;
  category?: string;
  area?: string;
  status?: string;
  priority?: string;
  sort?: 'newest' | 'upvotes' | 'priority' | string;
}

export interface OfficerStats {
  totalComplaints: number;
  newToday: number;
  pending: number;
  inProgress: number;
  resolved: number;
  resolvedThisWeek: number;
  overdue: number;
  critical: number;
  topCategories: { category: string; count: number }[];
  hotspotAreas: { area: string; count: number }[];
  mostUpvoted: { title: string; upvotes: number; priority: string; area: string }[];
}

export interface SatisfactionStats {
  averageSatisfaction: number;
  totalResponses: number;
  positiveFeedback: number;
  negativeFeedback: number;
  neutralFeedback: number;
  lowRatedComplaints: {
    _id: string;
    title: string;
    area: string;
    rating: number;
    comment?: string;
    officerRemark?: string;
  }[];
}
