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
    };
    Functions: {
      has_active_export_pass: {
        Args: { check_user_id: string | null; check_email: string | null };
        Returns: boolean;
      };
    };
  };
}
