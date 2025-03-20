
export type AdminType = 'admin' | 'super_admin' | null;

export interface Admin {
  id: string;
  email: string;
  full_name: string | null;
  admin_type: AdminType;
  created_at: string;
}

export interface AdminDetailProps {
  admin: Admin;
  onUpdate: (id: string, adminType: AdminType) => void;
  onDelete: (id: string) => void;
  currentUserIsSuper: boolean;
}

export interface OrderStatus {
  id: string;
  buyer_id: string;
  artwork_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripe_session_id: string | null;
  created_at: string;
  updated_at: string;
  buyer_email?: string;
  artwork_title?: string;
}

export interface SubmissionWithDetails {
  id: string;
  open_call_id: string;
  user_id: string;
  status: 'draft' | 'submitted' | 'under_review' | 'accepted' | 'rejected';
  submission_data: any;
  created_at: string;
  updated_at: string;
  feedback: string | null;
  user_email?: string;
  open_call_title?: string;
}
