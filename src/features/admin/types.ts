/**
 * Types and interfaces for Zenia Super Admin Panel
 */

export type AdminRole = 'superadmin' | 'finance_admin' | 'moderator' | 'support_agent' | 'analyst';

export type UserAccountStatus = 'active' | 'suspended' | 'restricted' | 'deactivated';

export interface LiveActivityEvent {
  id: string;
  type:
    | 'user_registered'
    | 'product_listed'
    | 'status_promoted'
    | 'payout_requested'
    | 'space_started'
    | 'report_submitted'
    | 'wallet_transfer';
  title: string;
  description: string;
  actor: string;
  actorAvatar?: string;
  timestamp: string;
  timeAgo: string;
  badgeColor?: string;
}

export interface AuditLogEntry {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
  status: 'success' | 'warning' | 'critical';
}

export interface SecurityAlert {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp: string;
  ipAddress?: string;
  affectedUser?: string;
  status: 'active' | 'investigating' | 'resolved';
  suggestedAction: string;
}

export interface SupportTicket {
  id: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  subject: string;
  category: 'malipo' | 'akaunti' | 'soko' | 'utapeli' | 'ufundi';
  priority: 'urgent' | 'high' | 'normal';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  lastUpdate: string;
  assignedTo?: string;
  messages: {
    sender: 'user' | 'admin';
    senderName: string;
    text: string;
    timestamp: string;
  }[];
}

export interface CommissionConfig {
  marketplace: number; // e.g. 2.5%
  promotedStatus: number; // e.g. 10%
  liveShopping: number; // e.g. 5%
  digitalServices: number; // e.g. 3%
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface AiManagementConfig {
  mode: 'active' | 'limited' | 'maintenance';
  model: string;
  rateLimitPerMin: number;
  dailyBudgetTzs: number;
  safetyThreshold: 'strict' | 'standard' | 'relaxed';
  requestsToday: number;
  requestsThisMonth: number;
  successRate: number;
  avgLatencyMs: number;
  estimatedCostTzs: number;
}

export interface LiveSpaceDetail {
  id: string;
  title: string;
  hostName: string;
  hostId: string;
  listenersCount: number;
  speakersCount: number;
  durationMinutes: number;
  reportedCount: number;
  isRecording: boolean;
  topic: string;
  status: 'active' | 'flagged' | 'ended';
}

export interface AdminJobItem {
  id: string;
  title: string;
  company: string;
  employerId: string;
  employerEmail: string;
  location: string;
  salary: string;
  type: string;
  postedAt: string;
  applicationsCount: number;
  isVerifiedEmployer: boolean;
  isFlaggedFake: boolean;
  status: 'active' | 'under_review' | 'closed';
}
