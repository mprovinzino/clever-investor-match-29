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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      coverage_areas: {
        Row: {
          area_name: string
          created_at: string
          geojson_data: Json
          id: string
          investor_id: string
          market_type: string | null
          updated_at: string
          zip_codes: string[] | null
        }
        Insert: {
          area_name: string
          created_at?: string
          geojson_data: Json
          id?: string
          investor_id: string
          market_type?: string | null
          updated_at?: string
          zip_codes?: string[] | null
        }
        Update: {
          area_name?: string
          created_at?: string
          geojson_data?: Json
          id?: string
          investor_id?: string
          market_type?: string | null
          updated_at?: string
          zip_codes?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "coverage_areas_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "investors"
            referencedColumns: ["id"]
          },
        ]
      }
      investor_applications: {
        Row: {
          acquisition_strategies: string[] | null
          budget_max: number | null
          budget_min: number | null
          cash_purchase_deals: number | null
          company_name: string
          created_at: string
          creative_financing_deals: number | null
          direct_purchase_markets: string | null
          email: string
          first_name: string
          id: string
          last_name: string
          listing_status: string[] | null
          novation_deals: number | null
          other_preferences: string | null
          phone_number: string
          previous_experience_files: string[] | null
          primary_markets: string | null
          property_condition: string[] | null
          property_types: string[] | null
          secondary_markets: string | null
          statewide_coverage: string[] | null
          status: string
          sub_to_deals: number | null
          text_consent: boolean | null
          timeframe: string[] | null
          updated_at: string
          wholesale_deals: number | null
          year_built_max: number | null
          year_built_min: number | null
        }
        Insert: {
          acquisition_strategies?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          cash_purchase_deals?: number | null
          company_name: string
          created_at?: string
          creative_financing_deals?: number | null
          direct_purchase_markets?: string | null
          email: string
          first_name: string
          id?: string
          last_name: string
          listing_status?: string[] | null
          novation_deals?: number | null
          other_preferences?: string | null
          phone_number: string
          previous_experience_files?: string[] | null
          primary_markets?: string | null
          property_condition?: string[] | null
          property_types?: string[] | null
          secondary_markets?: string | null
          statewide_coverage?: string[] | null
          status?: string
          sub_to_deals?: number | null
          text_consent?: boolean | null
          timeframe?: string[] | null
          updated_at?: string
          wholesale_deals?: number | null
          year_built_max?: number | null
          year_built_min?: number | null
        }
        Update: {
          acquisition_strategies?: string[] | null
          budget_max?: number | null
          budget_min?: number | null
          cash_purchase_deals?: number | null
          company_name?: string
          created_at?: string
          creative_financing_deals?: number | null
          direct_purchase_markets?: string | null
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          listing_status?: string[] | null
          novation_deals?: number | null
          other_preferences?: string | null
          phone_number?: string
          previous_experience_files?: string[] | null
          primary_markets?: string | null
          property_condition?: string[] | null
          property_types?: string[] | null
          secondary_markets?: string | null
          statewide_coverage?: string[] | null
          status?: string
          sub_to_deals?: number | null
          text_consent?: boolean | null
          timeframe?: string[] | null
          updated_at?: string
          wholesale_deals?: number | null
          year_built_max?: number | null
          year_built_min?: number | null
        }
        Relationships: []
      }
      investors: {
        Row: {
          buy_box: string | null
          company_name: string
          coverage_type: string | null
          created_at: string
          email: string
          external_id: string | null
          first_name: string
          hubspot_url: string | null
          id: string
          investor_tags: string[] | null
          is_cold: boolean | null
          last_name: string
          offer_types: string[] | null
          phone_number: string
          status: string
          tier: number | null
          updated_at: string
          weekly_cap: number | null
        }
        Insert: {
          buy_box?: string | null
          company_name: string
          coverage_type?: string | null
          created_at?: string
          email: string
          external_id?: string | null
          first_name: string
          hubspot_url?: string | null
          id?: string
          investor_tags?: string[] | null
          is_cold?: boolean | null
          last_name: string
          offer_types?: string[] | null
          phone_number: string
          status?: string
          tier?: number | null
          updated_at?: string
          weekly_cap?: number | null
        }
        Update: {
          buy_box?: string | null
          company_name?: string
          coverage_type?: string | null
          created_at?: string
          email?: string
          external_id?: string | null
          first_name?: string
          hubspot_url?: string | null
          id?: string
          investor_tags?: string[] | null
          is_cold?: boolean | null
          last_name?: string
          offer_types?: string[] | null
          phone_number?: string
          status?: string
          tier?: number | null
          updated_at?: string
          weekly_cap?: number | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
