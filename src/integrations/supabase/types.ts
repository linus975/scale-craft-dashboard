export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      designs: {
        Row: {
          cad_file_path: string | null
          cad_software: string | null
          category: string
          colors: string | null
          created_at: string
          description: string | null
          design_type: string
          ean_number: string | null
          gcode: string | null
          id: string
          ini_file_path: string | null
          material: string | null
          name: string
          nozzle_diameter: string | null
          preview_image_path: string | null
          replacement_value: string | null
          sketch_name: string | null
          slicer: string | null
          tracking_type: string | null
          updated_at: string
          user_id: string
          version: string | null
        }
        Insert: {
          cad_file_path?: string | null
          cad_software?: string | null
          category: string
          colors?: string | null
          created_at?: string
          description?: string | null
          design_type: string
          ean_number?: string | null
          gcode?: string | null
          id?: string
          ini_file_path?: string | null
          material?: string | null
          name: string
          nozzle_diameter?: string | null
          preview_image_path?: string | null
          replacement_value?: string | null
          sketch_name?: string | null
          slicer?: string | null
          tracking_type?: string | null
          updated_at?: string
          user_id: string
          version?: string | null
        }
        Update: {
          cad_file_path?: string | null
          cad_software?: string | null
          category?: string
          colors?: string | null
          created_at?: string
          description?: string | null
          design_type?: string
          ean_number?: string | null
          gcode?: string | null
          id?: string
          ini_file_path?: string | null
          material?: string | null
          name?: string
          nozzle_diameter?: string | null
          preview_image_path?: string | null
          replacement_value?: string | null
          sketch_name?: string | null
          slicer?: string | null
          tracking_type?: string | null
          updated_at?: string
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      machines: {
        Row: {
          api_key: string | null
          api_url: string | null
          connection_type: string
          created_at: string
          current_job_id: string | null
          id: string
          last_seen: string | null
          name: string
          notes: string | null
          password: string | null
          printer_type: string
          status: string
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          api_key?: string | null
          api_url?: string | null
          connection_type: string
          created_at?: string
          current_job_id?: string | null
          id?: string
          last_seen?: string | null
          name: string
          notes?: string | null
          password?: string | null
          printer_type: string
          status?: string
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          api_key?: string | null
          api_url?: string | null
          connection_type?: string
          created_at?: string
          current_job_id?: string | null
          id?: string
          last_seen?: string | null
          name?: string
          notes?: string | null
          password?: string | null
          printer_type?: string
          status?: string
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      marketplace_integrations: {
        Row: {
          api_key: string | null
          client_id: string | null
          created_at: string
          icon: string | null
          id: string
          last_sync: string | null
          marketplace_type: string
          name: string
          orders_synced: number | null
          status: string
          sync_frequency: string | null
          updated_at: string
          user_id: string
          webhook_url: string | null
        }
        Insert: {
          api_key?: string | null
          client_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          last_sync?: string | null
          marketplace_type: string
          name: string
          orders_synced?: number | null
          status?: string
          sync_frequency?: string | null
          updated_at?: string
          user_id: string
          webhook_url?: string | null
        }
        Update: {
          api_key?: string | null
          client_id?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          last_sync?: string | null
          marketplace_type?: string
          name?: string
          orders_synced?: number | null
          status?: string
          sync_frequency?: string | null
          updated_at?: string
          user_id?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      marketplace_orders: {
        Row: {
          amount: string | null
          created_at: string
          customer_email: string | null
          design_file: string | null
          ean_number: string | null
          id: string
          marketplace: string
          marketplace_integration_id: string | null
          material: string | null
          notes: string | null
          order_date: string | null
          order_id: string
          print_status: string
          product_id: string | null
          product_name: string
          quantity: number | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: string | null
          created_at?: string
          customer_email?: string | null
          design_file?: string | null
          ean_number?: string | null
          id?: string
          marketplace: string
          marketplace_integration_id?: string | null
          material?: string | null
          notes?: string | null
          order_date?: string | null
          order_id: string
          print_status?: string
          product_id?: string | null
          product_name: string
          quantity?: number | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: string | null
          created_at?: string
          customer_email?: string | null
          design_file?: string | null
          ean_number?: string | null
          id?: string
          marketplace?: string
          marketplace_integration_id?: string | null
          material?: string | null
          notes?: string | null
          order_date?: string | null
          order_id?: string
          print_status?: string
          product_id?: string | null
          product_name?: string
          quantity?: number | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_marketplace_integration_id_fkey"
            columns: ["marketplace_integration_id"]
            isOneToOne: false
            referencedRelation: "marketplace_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          ean_number: string | null
          id: string
          order_id: string
          personalization_data: Json | null
          product_id: string | null
          product_name: string
          quantity: number
          special_instructions: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          ean_number?: string | null
          id?: string
          order_id: string
          personalization_data?: Json | null
          product_id?: string | null
          product_name: string
          quantity?: number
          special_instructions?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          ean_number?: string | null
          id?: string
          order_id?: string
          personalization_data?: Json | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          special_instructions?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          currency: string | null
          customer_email: string | null
          customer_name: string | null
          id: string
          marketplace: string
          marketplace_order_id: string | null
          notes: string | null
          order_date: string | null
          order_number: string
          shipping_address: Json | null
          status: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          marketplace: string
          marketplace_order_id?: string | null
          notes?: string | null
          order_date?: string | null
          order_number: string
          shipping_address?: Json | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string | null
          customer_email?: string | null
          customer_name?: string | null
          id?: string
          marketplace?: string
          marketplace_order_id?: string | null
          notes?: string | null
          order_date?: string | null
          order_number?: string
          shipping_address?: Json | null
          status?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      print_jobs: {
        Row: {
          bed_temperature: number | null
          color: string | null
          completed_at: string | null
          created_at: string
          created_by: string
          ean_number: string | null
          estimated_completion: string | null
          estimated_material_usage: number | null
          estimated_print_time: number | null
          failure_reason: string | null
          gcode_file_path: string | null
          id: string
          infill_percentage: number | null
          job_number: string
          layer_height: number | null
          material: string | null
          model_file_path: string | null
          notes: string | null
          nozzle_temperature: number | null
          parameters: Json | null
          parent_job_id: string | null
          personalization_applied: boolean | null
          personalization_data: Json | null
          preview_image_path: string | null
          print_speed: number | null
          printer_id: string | null
          priority: number | null
          product_id: string | null
          product_name: string
          quantity: number
          queued_at: string | null
          source_order_id: string | null
          source_order_item_id: string | null
          source_type: string
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bed_temperature?: number | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          created_by: string
          ean_number?: string | null
          estimated_completion?: string | null
          estimated_material_usage?: number | null
          estimated_print_time?: number | null
          failure_reason?: string | null
          gcode_file_path?: string | null
          id?: string
          infill_percentage?: number | null
          job_number: string
          layer_height?: number | null
          material?: string | null
          model_file_path?: string | null
          notes?: string | null
          nozzle_temperature?: number | null
          parameters?: Json | null
          parent_job_id?: string | null
          personalization_applied?: boolean | null
          personalization_data?: Json | null
          preview_image_path?: string | null
          print_speed?: number | null
          printer_id?: string | null
          priority?: number | null
          product_id?: string | null
          product_name: string
          quantity?: number
          queued_at?: string | null
          source_order_id?: string | null
          source_order_item_id?: string | null
          source_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bed_temperature?: number | null
          color?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string
          ean_number?: string | null
          estimated_completion?: string | null
          estimated_material_usage?: number | null
          estimated_print_time?: number | null
          failure_reason?: string | null
          gcode_file_path?: string | null
          id?: string
          infill_percentage?: number | null
          job_number?: string
          layer_height?: number | null
          material?: string | null
          model_file_path?: string | null
          notes?: string | null
          nozzle_temperature?: number | null
          parameters?: Json | null
          parent_job_id?: string | null
          personalization_applied?: boolean | null
          personalization_data?: Json | null
          preview_image_path?: string | null
          print_speed?: number | null
          printer_id?: string | null
          priority?: number | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          queued_at?: string | null
          source_order_id?: string | null
          source_order_item_id?: string | null
          source_type?: string
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "print_jobs_parent_job_id_fkey"
            columns: ["parent_job_id"]
            isOneToOne: false
            referencedRelation: "print_jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_source_order_id_fkey"
            columns: ["source_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "print_jobs_source_order_item_id_fkey"
            columns: ["source_order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      product_ean_mapping: {
        Row: {
          created_at: string
          design_id: string | null
          ean_number: string
          id: string
          product_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          design_id?: string | null
          ean_number: string
          id?: string
          product_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          design_id?: string | null
          ean_number?: string
          id?: string
          product_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_ean_mapping_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      print_job_workflow_summary: {
        Row: {
          avg_hours_in_status: number | null
          job_count: number | null
          newest_job: string | null
          oldest_job: string | null
          status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_job_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
