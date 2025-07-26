export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      coverage_areas: {
        Row: {
          area_name: string
          area_type: string
          created_at: string
          geojson_data: Json
          id: string
          investor_id: number
          updated_at: string
        }
        Insert: {
          area_name: string
          area_type?: string
          created_at?: string
          geojson_data: Json
          id?: string
          investor_id: number
          updated_at?: string
        }
        Update: {
          area_name?: string
          area_type?: string
          created_at?: string
          geojson_data?: Json
          id?: string
          investor_id?: number
          updated_at?: string
        }
        Relationships: []
      }
      "Investor Network": {
        Row: {
          "Buy Box": string
          Cold: string
          "Company Name": string
          "Coverage Type": string
          "Direct Purchase": string
          "HS Company URL": string
          ID: number
          investment_strategies: string[] | null
          "Investor Tags": string
          "Main POC": string
          max_price: number | null
          max_sqft: number | null
          max_year_built: number | null
          min_price: number | null
          min_sqft: number | null
          min_year_built: number | null
          Notes: string | null
          "Offer Types": string
          "Primary Markets": string
          property_conditions: string[] | null
          property_types: string[] | null
          "Reason for Freeze": string
          "Secondary Markets": string
          Tier: number
          timeline_preferences: string[] | null
          user_id: string | null
          "Weekly Cap": number
          "Zip Codes": string | null
        }
        Insert: {
          "Buy Box": string
          Cold: string
          "Company Name": string
          "Coverage Type": string
          "Direct Purchase": string
          "HS Company URL": string
          ID?: number
          investment_strategies?: string[] | null
          "Investor Tags": string
          "Main POC": string
          max_price?: number | null
          max_sqft?: number | null
          max_year_built?: number | null
          min_price?: number | null
          min_sqft?: number | null
          min_year_built?: number | null
          Notes?: string | null
          "Offer Types": string
          "Primary Markets": string
          property_conditions?: string[] | null
          property_types?: string[] | null
          "Reason for Freeze": string
          "Secondary Markets": string
          Tier: number
          timeline_preferences?: string[] | null
          user_id?: string | null
          "Weekly Cap": number
          "Zip Codes"?: string | null
        }
        Update: {
          "Buy Box"?: string
          Cold?: string
          "Company Name"?: string
          "Coverage Type"?: string
          "Direct Purchase"?: string
          "HS Company URL"?: string
          ID?: number
          investment_strategies?: string[] | null
          "Investor Tags"?: string
          "Main POC"?: string
          max_price?: number | null
          max_sqft?: number | null
          max_year_built?: number | null
          min_price?: number | null
          min_sqft?: number | null
          min_year_built?: number | null
          Notes?: string | null
          "Offer Types"?: string
          "Primary Markets"?: string
          property_conditions?: string[] | null
          property_types?: string[] | null
          "Reason for Freeze"?: string
          "Secondary Markets"?: string
          Tier?: number
          timeline_preferences?: string[] | null
          user_id?: string | null
          "Weekly Cap"?: number
          "Zip Codes"?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          company?: string | null
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
      [_ in never]: never
    }
    Functions: {
      calculate_match_score: {
        Args: { p_property_id: string; p_investor_id: number }
        Returns: number
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
