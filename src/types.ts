/**
 * EduTrack AI Types
 */

export type UserRole = 'admin' | 'user';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Training {
  id: string;
  title: string;
  description: string;
  content_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

export type TrainingStatus = 'ongoing' | 'completed';

export interface UserTraining {
  id: string;
  user_id: string;
  training_id: string;
  status: TrainingStatus;
  progress: number;
  updated_at: string;
  training?: Training;
}

export interface Certificate {
  id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  extracted_data: {
    recipient_name?: string;
    course_name?: string;
    issue_date?: string;
    issuer?: string;
    validity_score?: number;
  };
  summary: string;
  status: 'pending' | 'valid' | 'invalid';
  created_at: string;
}
