// Database types for Supabase integration
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'seller' | 'transporter'
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role: 'admin' | 'seller' | 'transporter'
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'seller' | 'transporter'
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          id: string
          make: string
          model: string
          year: number
          vin: string | null
          status: 'pending' | 'sold' | 'withdrew' | 'complete' | 'arb'
          pickup_location: string | null
          odometer: number | null
          bought_price: number | null
          sold_price: number | null
          title_status: 'absent' | 'present' | 'in_transit' | 'received' | 'available_not_received' | 'released' | 'validated' | 'sent_but_not_validated'
          arb_status: 'absent' | 'present' | 'in_transit' | 'failed'
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          make: string
          model: string
          year: number
          vin?: string | null
          status?: 'pending' | 'sold' | 'withdrew' | 'complete' | 'arb'
          pickup_location?: string | null
          odometer?: number | null
          bought_price?: number | null
          sold_price?: number | null
          title_status?: 'absent' | 'present' | 'in_transit' | 'received' | 'available_not_received' | 'released' | 'validated' | 'sent_but_not_validated'
          arb_status?: 'absent' | 'present' | 'in_transit' | 'failed'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          make?: string
          model?: string
          year?: number
          vin?: string | null
          status?: 'pending' | 'sold' | 'withdrew' | 'complete' | 'arb'
          pickup_location?: string | null
          odometer?: number | null
          bought_price?: number | null
          sold_price?: number | null
          title_status?: 'absent' | 'present' | 'in_transit' | 'received' | 'available_not_received' | 'released' | 'validated' | 'sent_but_not_validated'
          arb_status?: 'absent' | 'present' | 'in_transit' | 'failed'
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      tasks: {
        Row: {
          id: string
          vehicle_id: string | null
          task_name: string
          due_date: string
          notes: string | null
          assigned_to: string | null
          assigned_by: string | null
          category: 'missing_title' | 'file_arb' | 'location' | 'general' | null
          status: 'pending' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          vehicle_id?: string | null
          task_name: string
          due_date: string
          notes?: string | null
          assigned_to?: string | null
          assigned_by?: string | null
          category?: 'missing_title' | 'file_arb' | 'location' | 'general' | null
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          vehicle_id?: string | null
          task_name?: string
          due_date?: string
          notes?: string | null
          assigned_to?: string | null
          assigned_by?: string | null
          category?: 'missing_title' | 'file_arb' | 'location' | 'general' | null
          status?: 'pending' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_vehicle_id_fkey"
            columns: ["vehicle_id"]
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_assigned_by_fkey"
            columns: ["assigned_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          id: string
          title: string
          event_date: string
          event_time: string
          assigned_to: string | null
          created_by: string | null
          notes: string | null
          status: 'scheduled' | 'completed' | 'cancelled'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          event_date: string
          event_time: string
          assigned_to?: string | null
          created_by?: string | null
          notes?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          event_date?: string
          event_time?: string
          assigned_to?: string | null
          created_by?: string | null
          notes?: string | null
          status?: 'scheduled' | 'completed' | 'cancelled'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_assigned_to_fkey"
            columns: ["assigned_to"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'error' | 'success'
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: 'info' | 'warning' | 'error' | 'success'
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: 'info' | 'warning' | 'error' | 'success'
          read?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      user_status: {
        Row: {
          user_id: string
          is_online: boolean
          last_seen: string
          updated_at: string
        }
        Insert: {
          user_id: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          is_online?: boolean
          last_seen?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_status_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Specific table types
export type Profile = Tables<'profiles'>
export type Vehicle = Tables<'vehicles'>
export type Task = Tables<'tasks'>
export type Event = Tables<'events'>
export type Message = Tables<'messages'>
export type Notification = Tables<'notifications'>
export type UserStatus = Tables<'user_status'>

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type VehicleInsert = Database['public']['Tables']['vehicles']['Insert']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type EventInsert = Database['public']['Tables']['events']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type VehicleUpdate = Database['public']['Tables']['vehicles']['Update']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type EventUpdate = Database['public']['Tables']['events']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']




