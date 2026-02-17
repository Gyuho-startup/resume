// Auto-generated types from Supabase (placeholder)
// Run: supabase gen types typescript --project-id YOUR_PROJECT_ID > types/supabase.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          is_ats_safe: boolean;
          version: string;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['templates']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['templates']['Insert']>;
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          role_slug: string | null;
          country: string;
          template_slug: string;
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['resumes']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['resumes']['Insert']>;
      };
      exports: {
        Row: {
          id: string;
          user_id: string;
          resume_id: string | null;
          template_id: string;
          watermark: boolean;
          source: 'guest' | 'user';
          storage_path: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['exports']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['exports']['Insert']>;
      };
      purchases: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          stripe_checkout_session_id: string;
          stripe_payment_intent_id: string | null;
          status: 'paid' | 'failed' | 'refunded';
          pass_start_at: string | null;
          pass_end_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['purchases']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['purchases']['Insert']>;
      };
      conversation_sessions: {
        Row: {
          id: string;
          user_id: string | null;
          guest_identifier: string | null;
          created_at: string;
          started_at: string;
          expires_at: string;
          payment_status: 'free' | 'gated' | 'paid';
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          amount_paid: number | null;
          conversation_data: Json;
          resume_data: Json | null;
          deleted_at: string | null;
          deletion_reason: string | null;
          user_agent: string | null;
          ip_address: string | null;
        };
        Insert: Omit<Database['public']['Tables']['conversation_sessions']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['conversation_sessions']['Insert']>;
      };
    };
    Functions: {
      has_active_export_pass: {
        Args: { check_user_id: string | null; check_email: string | null };
        Returns: boolean;
      };
    };
  };
}
