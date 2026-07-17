export type SubscriptionTier = "basic" | "premium" | null;

export interface MaxUser {
  id: string;
  email: string;
  auth_provider?: string;
  phone_number?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  last_username_change?: string | null;
  is_paid: boolean;
  subscription_tier?: SubscriptionTier;
  subscription_status?: string | null;
  subscription_end_date?: string | null;
  onboarding: {
    completed: boolean;
    goals?: string[];
    experience_level?: string;
    response_length?: "concise" | "medium" | "detailed";
    facial_scan_summary?: {
      overall_score?: number;
      potential_score?: number;
      archetype?: string;
      suggested_modules?: string[];
      scan_completed_at?: string;
    };
    [key: string]: unknown;
  };
  profile: {
    current_level: number;
    rank: number;
    streak_days: number;
    bio?: string;
    avatar_url?: string;
    master_schedule_streak?: number;
  };
  first_scan_completed: boolean;
  is_admin: boolean;
  is_scan_user: boolean;
  is_creator?: boolean;
  coaching_tone?: "default" | "hardcore" | "gentle" | "influencer";
}

/** Anonymous "Get started" accounts carry this email domain. */
export const ANON_EMAIL_SUFFIX = "@anon.trymax.app";
