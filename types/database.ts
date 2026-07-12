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
      users: {
        Row: {
          id: string;
          email: string | null;
          phone: string | null;
          role: "student" | "teacher" | "admin" | "parent";
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          phone?: string | null;
          role?: "student" | "teacher" | "admin" | "parent";
          created_at?: string;
        };
        Update: {
          email?: string | null;
          phone?: string | null;
          role?: "student" | "teacher" | "admin" | "parent";
        };
      };
    };
  };
}
