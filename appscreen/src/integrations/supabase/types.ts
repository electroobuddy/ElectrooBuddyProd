// Database types for ElectrooBuddy - matching web implementation

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      booking_notifications: {
        Row: {
          booking_id: string
          created_at: string | null
          id: string
          new_status: string
          old_status: string | null
          sent: boolean | null
          user_email: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          id?: string
          new_status: string
          old_status?: string | null
          sent?: boolean | null
          user_email?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          id?: string
          new_status?: string
          old_status?: string | null
          sent?: boolean | null
          user_email?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          address: string
          assigned_at: string | null
          assigned_technician_id: string | null
          assignment_date: string | null
          created_at: string
          custom_service_demand: string | null
          description: string | null
          email: string
          exact_location: string | null
          has_old_fan: string | null
          id: string
          is_electricity_supply_on: string | null
          is_switch_working: string | null
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          service_type: string
          status: string
          updated_at: string
          user_id: string | null
          coupon_code: string | null
          offer_id: string | null
          discount_amount: number | null
          original_amount: number | null
          final_amount: number | null
          offer_applied: boolean
        }
        Insert: {
          address: string
          assigned_at?: string | null
          assigned_technician_id?: string | null
          assignment_date?: string | null
          created_at?: string
          custom_service_demand?: string | null
          description?: string | null
          email: string
          exact_location?: string | null
          has_old_fan?: string | null
          id?: string
          is_electricity_supply_on?: string | null
          is_switch_working?: string | null
          name: string
          phone: string
          preferred_date: string
          preferred_time: string
          service_type: string
          status?: string
          updated_at?: string
          user_id?: string | null
          coupon_code?: string | null
          offer_id?: string | null
          discount_amount?: number | null
          original_amount?: number | null
          final_amount?: number | null
          offer_applied?: boolean
        }
        Update: {
          address?: string
          assigned_at?: string | null
          assigned_technician_id?: string | null
          assignment_date?: string | null
          created_at?: string
          custom_service_demand?: string | null
          description?: string | null
          email?: string
          exact_location?: string | null
          has_old_fan?: string | null
          id?: string
          is_electricity_supply_on?: string | null
          is_switch_working?: string | null
          name?: string
          phone?: string
          preferred_date?: string
          preferred_time?: string
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          coupon_code?: string | null
          offer_id?: string | null
          discount_amount?: number | null
          original_amount?: number | null
          final_amount?: number | null
          offer_applied?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          role: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          is_read: boolean
          created_at: string
          read_at: string | null
          type: string | null
          booking_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
          read_at?: string | null
          type?: string | null
          booking_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
          read_at?: string | null
          type?: string | null
          booking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          endpoint: string
          subscription_type: string
          subscription: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          endpoint: string
          subscription_type: string
          subscription: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          endpoint?: string
          subscription_type?: string
          subscription?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          id: string
          email: string
          email_confirmed_at: string | null
          phone: string | null
          phone_confirmed_at: string | null
          last_sign_in_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          email_confirmed_at?: string | null
          phone?: string | null
          phone_confirmed_at?: string | null
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          email?: string
          email_confirmed_at?: string | null
          phone?: string | null
          phone_confirmed_at?: string | null
          last_sign_in_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user" | "technician"
      offer_status: "active" | "inactive" | "scheduled" | "expired"
      offer_type: "percentage" | "flat" | "bogo" | "shipping" | "custom"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
