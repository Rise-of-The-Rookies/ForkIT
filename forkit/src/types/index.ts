/* ──────────────────────────────────────────────
   ForkIt — shared TypeScript types
   Maps 1-to-1 with the Supabase DB schema.
   ────────────────────────────────────────────── */

// ─── User ────────────────────────────────────

export type UserProfile = {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  personality_type: string | null
  budget_pref: 'low' | 'mid' | 'high' | null
  distance_pref: number | null
  created_at: string
}

export type UserPreferences = {
  user_id: string
  cuisine_tags: string[]
  dietary_tags: string[]
  notification_prefs: Record<string, unknown>
}

// ─── Restaurant ──────────────────────────────

export type Restaurant = {
  id: string
  google_place_id: string
  name: string
  cuisine: string
  lat: number
  lng: number
  price_range: 1 | 2 | 3 | 4
  rating: number
  photos: string[]

  // ── Cuisine classification (added 2026-05-07) ──
  cuisine_primary: string | null
  cuisine_secondary: string | null
  dish_types: string[]
  halal_likely: boolean
  classification_source: 'unclassified' | 'keyword' | 'gemini' | 'user_signal'
  classification_confidence: number
}

// ─── Dish ────────────────────────────────────

export type Dish = {
  id: string
  restaurant_id: string
  name: string
  photo_url: string | null
  description: string | null
  created_at: string
}

// ─── Social / Posts ──────────────────────────

export type Post = {
  id: string
  user_id: string
  restaurant_id: string
  media_urls: string[]
  media_type: 'photo' | 'video'
  caption: string | null
  hashtags: string[]
  created_at: string
}

// ─── Group Rooms ─────────────────────────────

export type GroupRoom = {
  id: string
  host_id: string
  code: string
  status: 'waiting' | 'swiping' | 'revealed' | 'done'
  filters: Record<string, unknown>
  created_at: string
}

// ─── Saved Places ────────────────────────────

export type SavedPlace = {
  user_id: string
  restaurant_id: string
  saved_at: string
  geofence_active: boolean
  last_notified_at: string | null
  visit_count: number
}

// ─── Reviews ─────────────────────────────────

export type Review = {
  id: string
  user_id: string
  restaurant_id: string
  rating: number
  body: string | null
  created_at: string
}

// ─── Supabase Database type stub ─────────────
// Replace with auto-generated types from
//   npx supabase gen types typescript --project-id <id>
// once the schema is finalised.

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: Partial<UserProfile> & Pick<UserProfile, 'id' | 'display_name'>
        Update: Partial<UserProfile>
      }
      user_preferences: {
        Row: UserPreferences
        Insert: Partial<UserPreferences> & Pick<UserPreferences, 'user_id'>
        Update: Partial<UserPreferences>
      }
      restaurants: {
        Row: Restaurant
        Insert: Partial<Restaurant> & Pick<Restaurant, 'id' | 'google_place_id' | 'name'>
        Update: Partial<Restaurant>
      }
      posts: {
        Row: Post
        Insert: Partial<Post> & Pick<Post, 'id' | 'user_id' | 'restaurant_id'>
        Update: Partial<Post>
      }
      group_rooms: {
        Row: GroupRoom
        Insert: Partial<GroupRoom> & Pick<GroupRoom, 'id' | 'host_id' | 'code'>
        Update: Partial<GroupRoom>
      }
      saved_places: {
        Row: SavedPlace
        Insert: Partial<SavedPlace> & Pick<SavedPlace, 'user_id' | 'restaurant_id'>
        Update: Partial<SavedPlace>
      }
      reviews: {
        Row: Review
        Insert: Partial<Review> & Pick<Review, 'user_id' | 'restaurant_id' | 'rating'>
        Update: Partial<Review>
      }
      dishes: {
        Row: Dish
        Insert: Partial<Dish> & Pick<Dish, 'restaurant_id' | 'name'>
        Update: Partial<Dish>
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
