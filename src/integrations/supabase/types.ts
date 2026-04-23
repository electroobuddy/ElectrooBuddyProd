export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
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
        }
        Relationships: [
          {
            foreignKeyName: "bookings_assigned_technician_id_fkey"
            columns: ["assigned_technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          installation_service: boolean
          product_id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          installation_service?: boolean
          product_id: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          installation_service?: boolean
          product_id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          read: boolean
          service: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone: string
          read?: boolean
          service?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          read?: boolean
          service?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_order_value: number | null
          usage_limit: number | null
          used_count: number
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_order_value?: number | null
          usage_limit?: number | null
          used_count?: number
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          fulfillment_status: string
          id: string
          installation_charge: number
          installation_service: boolean
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          total_price: number
          tracking_number: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string
          fulfillment_status?: string
          id?: string
          installation_charge?: number
          installation_service?: boolean
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          total_price: number
          tracking_number?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string
          fulfillment_status?: string
          id?: string
          installation_charge?: number
          installation_service?: boolean
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total_price?: number
          tracking_number?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          cancelled_at: string | null
          confirmed_at: string | null
          courier_name: string | null
          created_at: string
          customer_notes: string | null
          delivered_at: string | null
          discount_amount: number
          estimated_delivery_date: string | null
          fulfillment_status: string
          id: string
          installation_total: number
          order_number: string
          ordered_at: string
          payment_method: string | null
          payment_status: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          shipped_at: string | null
          shipping_address_data: Json | null
          shipping_address_id: string | null
          shipping_carrier: string | null
          shipping_charge: number
          shipping_dimensions: Json | null
          shipping_weight: number | null
          shiprocket_order_id: number | null
          shiprocket_shipment_id: number | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          tracking_history: Json | null
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          courier_name?: string | null
          created_at?: string
          customer_notes?: string | null
          delivered_at?: string | null
          discount_amount?: number
          estimated_delivery_date?: string | null
          fulfillment_status?: string
          id?: string
          installation_total?: number
          order_number: string
          ordered_at?: string
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipped_at?: string | null
          shipping_address_data?: Json | null
          shipping_address_id?: string | null
          shipping_carrier?: string | null
          shipping_charge?: number
          shipping_dimensions?: Json | null
          shipping_weight?: number | null
          shiprocket_order_id?: number | null
          shiprocket_shipment_id?: number | null
          status?: string
          subtotal: number
          tax_amount?: number
          total_amount: number
          tracking_history?: Json | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          cancelled_at?: string | null
          confirmed_at?: string | null
          courier_name?: string | null
          created_at?: string
          customer_notes?: string | null
          delivered_at?: string | null
          discount_amount?: number
          estimated_delivery_date?: string | null
          fulfillment_status?: string
          id?: string
          installation_total?: number
          order_number?: string
          ordered_at?: string
          payment_method?: string | null
          payment_status?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          shipped_at?: string | null
          shipping_address_data?: Json | null
          shipping_address_id?: string | null
          shipping_carrier?: string | null
          shipping_charge?: number
          shipping_dimensions?: Json | null
          shipping_weight?: number | null
          shiprocket_order_id?: number | null
          shiprocket_shipment_id?: number | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          tracking_history?: Json | null
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_shipping_address_id_fkey"
            columns: ["shipping_address_id"]
            isOneToOne: false
            referencedRelation: "shipping_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          helpful_count: number
          id: string
          images: string[] | null
          is_approved: boolean
          is_verified_purchase: boolean
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          images?: string[] | null
          is_approved?: boolean
          is_verified_purchase?: boolean
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          helpful_count?: number
          id?: string
          images?: string[] | null
          is_approved?: boolean
          is_verified_purchase?: boolean
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          allow_backorder: boolean
          brand: string | null
          category: string | null
          compare_at_price: number | null
          cost_per_item: number | null
          created_at: string
          description: string
          dimension_unit: string | null
          gallery_images: string[] | null
          height: number | null
          id: string
          installation_available: boolean
          installation_charge: number | null
          installation_description: string | null
          inventory_quantity: number
          is_active: boolean
          is_bestseller: boolean
          is_featured: boolean
          length: number | null
          main_image_url: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          price: number
          short_description: string | null
          sku: string | null
          slug: string
          sort_order: number
          specifications: Json | null
          subcategory: string | null
          tags: string[] | null
          track_inventory: boolean
          updated_at: string
          weight: number | null
          weight_unit: string | null
          width: number | null
        }
        Insert: {
          allow_backorder?: boolean
          brand?: string | null
          category?: string | null
          compare_at_price?: number | null
          cost_per_item?: number | null
          created_at?: string
          description: string
          dimension_unit?: string | null
          gallery_images?: string[] | null
          height?: number | null
          id?: string
          installation_available?: boolean
          installation_charge?: number | null
          installation_description?: string | null
          inventory_quantity?: number
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          length?: number | null
          main_image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          price: number
          short_description?: string | null
          sku?: string | null
          slug: string
          sort_order?: number
          specifications?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          track_inventory?: boolean
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
          width?: number | null
        }
        Update: {
          allow_backorder?: boolean
          brand?: string | null
          category?: string | null
          compare_at_price?: number | null
          cost_per_item?: number | null
          created_at?: string
          description?: string
          dimension_unit?: string | null
          gallery_images?: string[] | null
          height?: number | null
          id?: string
          installation_available?: boolean
          installation_charge?: number | null
          installation_description?: string | null
          inventory_quantity?: number
          is_active?: boolean
          is_bestseller?: boolean
          is_featured?: boolean
          length?: number | null
          main_image_url?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          price?: number
          short_description?: string | null
          sku?: string | null
          slug?: string
          sort_order?: number
          specifications?: Json | null
          subcategory?: string | null
          tags?: string[] | null
          track_inventory?: boolean
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
          width?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string | null
          email_sent: boolean | null
          email_sent_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          order_id: string | null
          read_at: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          order_id?: string | null
          read_at?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          email_sent?: boolean | null
          email_sent_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          order_id?: string | null
          read_at?: string | null
          title?: string
          type?: string
          user_id?: string | null
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
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_booking_assigned: boolean
          email_booking_cancelled: boolean
          email_booking_completed: boolean
          email_booking_confirmed: boolean
          email_booking_created: boolean
          id: string
          in_app_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_booking_assigned?: boolean
          email_booking_cancelled?: boolean
          email_booking_completed?: boolean
          email_booking_confirmed?: boolean
          email_booking_created?: boolean
          id?: string
          in_app_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_booking_assigned?: boolean
          email_booking_cancelled?: boolean
          email_booking_completed?: boolean
          email_booking_confirmed?: boolean
          email_booking_created?: boolean
          id?: string
          in_app_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          image_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          image_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          image_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string | null
          endpoint: string | null
          subscription: Json
          browser_name: string | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          endpoint?: string | null
          subscription: Json
          browser_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          endpoint?: string | null
          subscription?: Json
          browser_name?: string | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          book_now_enabled: boolean
          call_enabled: boolean
          created_at: string
          description: string
          icon_name: string
          id: string
          image_url: string | null
          sort_order: number
          title: string
          updated_at: string
          whatsapp_enabled: boolean
        }
        Insert: {
          book_now_enabled?: boolean
          call_enabled?: boolean
          created_at?: string
          description: string
          icon_name?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title: string
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Update: {
          book_now_enabled?: boolean
          call_enabled?: boolean
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          image_url?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      shipping_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          address_type: string | null
          city: string
          country: string
          created_at: string
          email: string
          first_name: string
          id: string
          is_default: boolean
          landmark: string | null
          last_name: string
          phone: string
          postal_code: string
          shiprocket_address_id: number | null
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          address_type?: string | null
          city: string
          country?: string
          created_at?: string
          email: string
          first_name: string
          id?: string
          is_default?: boolean
          landmark?: string | null
          last_name: string
          phone: string
          postal_code: string
          shiprocket_address_id?: number | null
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          address_type?: string | null
          city?: string
          country?: string
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          is_default?: boolean
          landmark?: string | null
          last_name?: string
          phone?: string
          postal_code?: string
          shiprocket_address_id?: number | null
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_settings: {
        Row: {
          auto_create_shipment: boolean
          created_at: string
          default_breadth: number | null
          default_height: number | null
          default_length: number | null
          default_weight: number | null
          email: string | null
          enabled: boolean
          id: number
          password: string | null
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          auto_create_shipment?: boolean
          created_at?: string
          default_breadth?: number | null
          default_height?: number | null
          default_length?: number | null
          default_weight?: number | null
          email?: string | null
          enabled?: boolean
          id?: number
          password?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          auto_create_shipment?: boolean
          created_at?: string
          default_breadth?: number | null
          default_height?: number | null
          default_length?: number | null
          default_weight?: number | null
          email?: string | null
          enabled?: boolean
          id?: number
          password?: string | null
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          photo_url: string | null
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          photo_url?: string | null
          role: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      technicians: {
        Row: {
          address: string | null
          created_at: string | null
          daily_limit: number | null
          email: string
          experience: number | null
          id: string
          name: string
          phone: string | null
          priority: number | null
          profile_url: string | null
          skills: string[] | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          daily_limit?: number | null
          email: string
          experience?: number | null
          id?: string
          name: string
          phone?: string | null
          priority?: number | null
          profile_url?: string | null
          skills?: string[] | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          daily_limit?: number | null
          email?: string
          experience?: number | null
          id?: string
          name?: string
          phone?: string | null
          priority?: number | null
          profile_url?: string | null
          skills?: string[] | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          rating: number
          service: string | null
          text: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          rating?: number
          service?: string | null
          text: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          rating?: number
          service?: string | null
          text?: string
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
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_products: {
        Row: {
          id: string
          offer_id: string
          product_id: string
        }
        Insert: {
          id?: string
          offer_id: string
          product_id: string
        }
        Update: {
          id?: string
          offer_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_products_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      offer_services: {
        Row: {
          id: string
          offer_id: string
          service_id: string
        }
        Insert: {
          id?: string
          offer_id: string
          service_id: string
        }
        Update: {
          id?: string
          offer_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "offer_services_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      offers: {
        Row: {
          banner_url: string | null
          bg_gradient: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_purchase: number | null
          priority: number
          start_date: string
          status: Database["public"]["Enums"]["offer_status"]
          subtitle: string | null
          title: string
          type: Database["public"]["Enums"]["offer_type"]
          updated_at: string
          value: number | null
          visibility: string[]
        }
        Insert: {
          banner_url?: string | null
          bg_gradient?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_purchase?: number | null
          priority?: number
          start_date?: string
          status?: Database["public"]["Enums"]["offer_status"]
          subtitle?: string | null
          title: string
          type?: Database["public"]["Enums"]["offer_type"]
          updated_at?: string
          value?: number | null
          visibility?: string[]
        }
        Update: {
          banner_url?: string | null
          bg_gradient?: string | null
          created_at?: string
          cta_link?: string | null
          cta_text?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean
          max_discount?: number | null
          min_purchase?: number | null
          priority?: number
          start_date?: string
          status?: Database["public"]["Enums"]["offer_status"]
          subtitle?: string | null
          title?: string
          type?: Database["public"]["Enums"]["offer_type"]
          updated_at?: string
          value?: number | null
          visibility?: string[]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_cart_total: {
        Args: { _user_id: string }
        Returns: {
          installation_total: number
          subtotal: number
          total_items: number
        }[]
      }
      calculate_shipping_charge: {
        Args: {
          p_state: string
          p_order_value: number
          p_total_weight?: number
        }
        Returns: {
          shipping_charge: number
          zone_name: string
          estimated_days: string
          free_shipping: boolean
        }[]
      }
      apply_coupon: {
        Args: {
          p_coupon_code: string
          p_user_id: string
          p_cart_total: number
          p_cart_items?: Json
        }
        Returns: {
          success: boolean
          discount_amount: number
          message: string
          coupon_data: Json
        }[]
      }
      increment_coupon_usage: {
        Args: {
          p_coupon_code: string
        }
        Returns: boolean
      }
      get_active_coupons: {
        Args: {
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          code: string
          description: string | null
          discount_type: string
          discount_value: number
          min_order_value: number | null
          max_discount_amount: number | null
          usage_limit: number | null
          used_count: number
          usage_percentage: number | null
          valid_from: string
          valid_until: string | null
          is_active: boolean
          created_at: string
        }[]
      }
      generate_order_number: { Args: never; Returns: string }
      get_cache_hit_ratio: {
        Args: never
        Returns: {
          heap_blks_hit: number
          heap_blks_read: number
          ratio: number
        }[]
      }
      get_database_size: {
        Args: never
        Returns: {
          total_bytes: number
          total_size: string
        }[]
      }
      get_index_stats: {
        Args: never
        Returns: {
          idx_scan: number
          index_size: string
          indexname: string
          tablename: string
        }[]
      }
      get_system_metrics: {
        Args: never
        Returns: {
          active_connections: number
          dead_tuples: number
          last_analyze: string
          last_vacuum: string
          slow_queries: number
          total_queries: number
          uptime: string
        }[]
      }
      get_table_sizes: {
        Args: never
        Returns: {
          data_size: string
          index_size: string
          row_count: number
          table_name: string
          total_size: string
        }[]
      }
      get_technician_today_assignments: {
        Args: { technician_id: string }
        Returns: number
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: string
          p_title: string
          p_message: string
          p_booking_id?: string
          p_metadata?: Json
        }
        Returns: string
      }
      mark_notification_read: {
        Args: {
          p_notification_id: string
          p_user_id: string
        }
        Returns: boolean
      }
      mark_all_notifications_read: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      get_unread_notification_count: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: never
        Returns: boolean
      }
      confirm_user_email: {
        Args: {
          p_user_id: string
        }
        Returns: boolean
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      get_active_offers: {
        Args: { p_visibility: string }
        Returns: {
          banner_url: string | null
          bg_gradient: string | null
          created_at: string
          cta_link: string | null
          cta_text: string | null
          description: string | null
          end_date: string | null
          id: string
          is_active: boolean
          max_discount: number | null
          min_purchase: number | null
          priority: number
          start_date: string
          status: Database["public"]["Enums"]["offer_status"]
          subtitle: string | null
          title: string
          type: Database["public"]["Enums"]["offer_type"]
          updated_at: string
          value: number | null
          visibility: string[]
        }[]
      }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user", "technician"],
    },
  },
} as const
