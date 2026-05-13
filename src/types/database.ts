export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      brands: {
        Row: {
          id: string
          slug: string
          domain: string | null
          name: string
          tagline: string | null
          hero_image: string | null
          accent_color: string | null
          display_order: number
          is_active: boolean
          about_text: string
          asesoria_text: string | null
          seo_title: string | null
          seo_description: string | null
          whatsapp_number: string | null
          contact_email: string | null
          instagram_url: string | null
          facebook_url: string | null
          tiktok_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          slug: string
          domain?: string | null
          name: string
          tagline?: string | null
          hero_image?: string | null
          accent_color?: string | null
          display_order?: number
          is_active?: boolean
          about_text?: string
          asesoria_text?: string | null
          seo_title?: string | null
          seo_description?: string | null
          whatsapp_number?: string | null
          contact_email?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          slug?: string
          domain?: string | null
          name?: string
          tagline?: string | null
          hero_image?: string | null
          accent_color?: string | null
          display_order?: number
          is_active?: boolean
          about_text?: string
          asesoria_text?: string | null
          seo_title?: string | null
          seo_description?: string | null
          whatsapp_number?: string | null
          contact_email?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: []
      }
      brand_services: {
        Row: {
          id: string
          brand_id: string
          name: string
          description: string | null
          icon: string | null
          image_url: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          name: string
          description?: string | null
          icon?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          name?: string
          description?: string | null
          icon?: string | null
          image_url?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_services_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_slides: {
        Row: {
          id: string
          brand_id: string
          title: string
          subtitle: string | null
          image_url: string | null
          cta_label: string | null
          cta_href: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          title: string
          subtitle?: string | null
          image_url?: string | null
          cta_label?: string | null
          cta_href?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          title?: string
          subtitle?: string | null
          image_url?: string | null
          cta_label?: string | null
          cta_href?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_slides_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_team: {
        Row: {
          id: string
          brand_id: string
          member_name: string
          role: string
          photo_url: string | null
          bio: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          member_name: string
          role: string
          photo_url?: string | null
          bio?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          member_name?: string
          role?: string
          photo_url?: string | null
          bio?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_team_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_stats: {
        Row: {
          id: string
          brand_id: string
          label: string
          value: string
          suffix: string | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          label: string
          value: string
          suffix?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          label?: string
          value?: string
          suffix?: string | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_stats_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_testimonials: {
        Row: {
          id: string
          brand_id: string
          author_name: string
          author_role: string | null
          author_company: string | null
          author_photo_url: string | null
          quote: string
          rating: number | null
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          author_name: string
          author_role?: string | null
          author_company?: string | null
          author_photo_url?: string | null
          quote: string
          rating?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          author_name?: string
          author_role?: string | null
          author_company?: string | null
          author_photo_url?: string | null
          quote?: string
          rating?: number | null
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_testimonials_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_media: {
        Row: {
          id: string
          brand_id: string
          uploader_id: string | null
          kind: "image" | "video" | "document" | "embed"
          url: string
          thumbnail_url: string | null
          title: string | null
          description: string | null
          mime_type: string | null
          size_bytes: number | null
          duration_seconds: number | null
          embed_provider: string | null
          embed_html: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          uploader_id?: string | null
          kind: "image" | "video" | "document" | "embed"
          url: string
          thumbnail_url?: string | null
          title?: string | null
          description?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          duration_seconds?: number | null
          embed_provider?: string | null
          embed_html?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          uploader_id?: string | null
          kind?: "image" | "video" | "document" | "embed"
          url?: string
          thumbnail_url?: string | null
          title?: string | null
          description?: string | null
          mime_type?: string | null
          size_bytes?: number | null
          duration_seconds?: number | null
          embed_provider?: string | null
          embed_html?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_media_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_media_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_pages: {
        Row: {
          id: string
          brand_id: string
          slug: string
          title: string
          subtitle: string | null
          content_html: string
          hero_image: string | null
          show_in_menu: boolean
          menu_order: number
          status: "draft" | "published" | "archived"
          seo_title: string | null
          seo_description: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          brand_id: string
          slug: string
          title: string
          subtitle?: string | null
          content_html?: string
          hero_image?: string | null
          show_in_menu?: boolean
          menu_order?: number
          status?: "draft" | "published" | "archived"
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          brand_id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          content_html?: string
          hero_image?: string | null
          show_in_menu?: boolean
          menu_order?: number
          status?: "draft" | "published" | "archived"
          seo_title?: string | null
          seo_description?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_pages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          brand_id: string
          slug: string
          name: string
          description: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          slug: string
          name: string
          description?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          slug?: string
          name?: string
          description?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          brand_id: string
          slug: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          slug: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          slug?: string
          name?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tags: {
        Row: {
          post_id: string
          tag_id: string
        }
        Insert: {
          post_id: string
          tag_id: string
        }
        Update: {
          post_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tags_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          id: string
          brand_id: string
          slug: string
          title: string
          subtitle: string | null
          excerpt: string
          content: Json
          content_html: string
          featured_image: string | null
          accent_color: string | null
          author_id: string
          category_id: string | null
          status: Database["public"]["Enums"]["post_status"]
          published_at: string | null
          scheduled_for: string | null
          read_time_minutes: number | null
          view_count: number
          search_vector: unknown | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          brand_id: string
          slug: string
          title: string
          subtitle?: string | null
          excerpt: string
          content: Json
          content_html: string
          featured_image?: string | null
          accent_color?: string | null
          author_id: string
          category_id?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          published_at?: string | null
          scheduled_for?: string | null
          read_time_minutes?: number | null
          view_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          brand_id?: string
          slug?: string
          title?: string
          subtitle?: string | null
          excerpt?: string
          content?: Json
          content_html?: string
          featured_image?: string | null
          accent_color?: string | null
          author_id?: string
          category_id?: string | null
          status?: Database["public"]["Enums"]["post_status"]
          published_at?: string | null
          scheduled_for?: string | null
          read_time_minutes?: number | null
          view_count?: number
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          role: Database["public"]["Enums"]["user_role"]
          brand_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          brand_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          brand_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          id: string
          post_id: string
          brand_id: string
          author_id: string
          content: string
          status: Database["public"]["Enums"]["comment_status"]
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          post_id: string
          brand_id: string
          author_id: string
          content: string
          status?: Database["public"]["Enums"]["comment_status"]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          post_id?: string
          brand_id?: string
          author_id?: string
          content?: string
          status?: Database["public"]["Enums"]["comment_status"]
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_categories: {
        Row: {
          id: string
          brand_id: string
          parent_id: string | null
          slug: string
          name: string
          description: string | null
          icon: string | null
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          parent_id?: string | null
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          parent_id?: string | null
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_categories_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_threads: {
        Row: {
          id: string
          brand_id: string
          category_id: string
          author_id: string
          slug: string
          title: string
          content: string
          pinned: boolean
          view_count: number
          reply_count: number
          last_reply_at: string | null
          last_reply_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          brand_id: string
          category_id: string
          author_id: string
          slug: string
          title: string
          content: string
          pinned?: boolean
          view_count?: number
          reply_count?: number
          last_reply_at?: string | null
          last_reply_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          brand_id?: string
          category_id?: string
          author_id?: string
          slug?: string
          title?: string
          content?: string
          pinned?: boolean
          view_count?: number
          reply_count?: number
          last_reply_at?: string | null
          last_reply_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_threads_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_threads_last_reply_by_fkey"
            columns: ["last_reply_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          id: string
          brand_id: string
          full_name: string
          email: string
          phone: string | null
          tax_id: string | null
          attachment_url: string | null
          attachment_name: string | null
          subject: string
          message: string
          status: Database["public"]["Enums"]["contact_message_status"]
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          brand_id: string
          full_name: string
          email: string
          phone?: string | null
          tax_id?: string | null
          attachment_url?: string | null
          attachment_name?: string | null
          subject: string
          message: string
          status?: Database["public"]["Enums"]["contact_message_status"]
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          brand_id?: string
          full_name?: string
          email?: string
          phone?: string | null
          tax_id?: string | null
          attachment_url?: string | null
          attachment_name?: string | null
          subject?: string
          message?: string
          status?: Database["public"]["Enums"]["contact_message_status"]
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          id: string
          thread_id: string
          author_id: string
          content: string
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          thread_id: string
          author_id: string
          content: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          thread_id?: string
          author_id?: string
          content?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "forum_threads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      case_priority: "low" | "medium" | "high"
      case_status: "new" | "in_review" | "in_progress" | "resolved" | "closed"
      comment_status: "pending" | "approved" | "rejected"
      contact_message_status: "nuevo" | "leido" | "respondido"
      moderation_action:
        | "approve"
        | "reject"
        | "delete"
        | "pin"
        | "lock"
        | "hide"
        | "suspend"
      moderation_target: "comment" | "thread" | "reply" | "user"
      post_status: "draft" | "scheduled" | "published" | "archived"
      user_role: "admin" | "user" | "superadmin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      case_priority: ["low", "medium", "high"],
      case_status: ["new", "in_review", "in_progress", "resolved", "closed"],
      comment_status: ["pending", "approved", "rejected"],
      contact_message_status: ["nuevo", "leido", "respondido"],
      moderation_action: [
        "approve",
        "reject",
        "delete",
        "pin",
        "lock",
        "hide",
        "suspend",
      ],
      moderation_target: ["comment", "thread", "reply", "user"],
      post_status: ["draft", "scheduled", "published", "archived"],
      user_role: ["admin", "user", "superadmin"],
    },
  },
} as const
