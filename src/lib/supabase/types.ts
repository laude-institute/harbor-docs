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
      dataset: {
        Row: {
          name: string;
          version: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          version: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          version?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      dataset_task: {
        Row: {
          id: number;
          dataset_name: string;
          dataset_version: string;
          name: string;
          git_url: string;
          git_commit_id: string;
          path: string;
          created_at: string;
        };
        Insert: {
          id?: never;
          dataset_name: string;
          dataset_version: string;
          name: string;
          git_url: string;
          git_commit_id: string;
          path: string;
          created_at?: string;
        };
        Update: {
          id?: never;
          dataset_name?: string;
          dataset_version?: string;
          name?: string;
          git_url?: string;
          git_commit_id?: string;
          path?: string;
          created_at?: string;
        };
      };
      dataset_metric: {
        Row: {
          id: number;
          dataset_name: string;
          dataset_version: string;
          metric_name: string;
          kwargs: Json | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          dataset_name: string;
          dataset_version: string;
          metric_name: string;
          kwargs?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: never;
          dataset_name?: string;
          dataset_version?: string;
          metric_name?: string;
          kwargs?: Json | null;
          created_at?: string;
        };
      };
      dataset_access_log: {
        Row: {
          id: number;
          dataset_name: string;
          dataset_version: string;
          accessed_at: string;
        };
        Insert: {
          id?: never;
          dataset_name: string;
          dataset_version: string;
          accessed_at?: string;
        };
        Update: {
          id?: never;
          dataset_name?: string;
          dataset_version?: string;
          accessed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types for working with the database
export type Dataset = Database["public"]["Tables"]["dataset"]["Row"];
export type DatasetTask = Database["public"]["Tables"]["dataset_task"]["Row"];
export type DatasetMetric = Database["public"]["Tables"]["dataset_metric"]["Row"];
export type DatasetAccessLog = Database["public"]["Tables"]["dataset_access_log"]["Row"];
