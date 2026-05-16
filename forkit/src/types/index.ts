/* ──────────────────────────────────────────────
   ForkIt — shared TypeScript types
   Maps 1-to-1 with the Supabase DB schema.
   ────────────────────────────────────────────── */

// ─── Food Keyword Taxonomy ───────────────────

export type FoodCategory =
  | 'malay' | 'chinese' | 'japanese' | 'korean' | 'thai'
  | 'vietnamese' | 'indian' | 'middle_eastern' | 'southeast_asian'
  | 'east_asian' | 'western' | 'european' | 'latin_american'
  | 'african' | 'south_asian' | 'seafood' | 'vegetarian_vegan'
  | 'dietary' | 'format' | 'dessert' | 'drinks' | 'venue'
  | 'occasion' | 'price'

export type KeywordType =
  | 'dish' | 'venue' | 'diet' | 'occasion' | 'price'
  | 'method' | 'format' | 'ingredient' | 'drink' | 'dessert'

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

  // ── Venue type & searchable tags (added 2026-05-16) ──
  venue_type: string | null
  searchable_tags: string[]
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

// ─── Trending Scores ─────────────────────────

export type TrendingScore = {
  id: string
  restaurant_id: string
  score_daily: number
  score_weekly: number
  rank_local: number | null
  rank_city: number | null
  rank_national: number | null
  score_delta_pct: number
  top_signals: Record<string, unknown>
  region: string
  computed_at: string
}

// ─── Search History ──────────────────────────

export type SearchHistory = {
  id: string
  user_id: string
  query: string
  result_count: number
  tapped_result: string | null
  searched_at: string
}

// ─── Friends ─────────────────────────────────

export type Friend = {
  user_id: string
  friend_id: string
  status: 'pending' | 'accepted'
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

export type PostInteraction = {
  id: string
  post_id: string
  user_id: string
  type: 'like' | 'save' | 'reshare'
  created_at: string
}

export type Comment = {
  id: string
  post_id: string
  user_id: string
  body: string
  parent_id: string | null
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

export type RoomMember = {
  room_id: string
  user_id: string
  joined_at: string
  finished_swiping: boolean
}

export type Swipe = {
  id: string
  room_id: string
  user_id: string
  restaurant_id: string
  direction: 'yes' | 'no'
  swiped_at: string
}

// ─── Notification Log ────────────────────────

export type NotificationLog = {
  id: string
  user_id: string
  type: string
  restaurant_id: string | null
  sent_at: string
  opened: boolean
}

// ─── Taste Signals ───────────────────────────

export type TasteSignal = {
  id: string
  user_id: string
  signal_type: string
  cuisine_tag: string | null
  restaurant_id: string | null
  weight: number
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
      trending_scores: {
        Row: TrendingScore
        Insert: Partial<TrendingScore> & Pick<TrendingScore, 'restaurant_id'>
        Update: Partial<TrendingScore>
      }
      search_history: {
        Row: SearchHistory
        Insert: Partial<SearchHistory> & Pick<SearchHistory, 'user_id' | 'query'>
        Update: Partial<SearchHistory>
      }
      friends: {
        Row: Friend
        Insert: Partial<Friend> & Pick<Friend, 'user_id' | 'friend_id'>
        Update: Partial<Friend>
      }
      room_members: {
        Row: RoomMember
        Insert: Partial<RoomMember> & Pick<RoomMember, 'room_id' | 'user_id'>
        Update: Partial<RoomMember>
      }
      swipes: {
        Row: Swipe
        Insert: Partial<Swipe> & Pick<Swipe, 'room_id' | 'user_id' | 'restaurant_id' | 'direction'>
        Update: Partial<Swipe>
      }
      post_interactions: {
        Row: PostInteraction
        Insert: Partial<PostInteraction> & Pick<PostInteraction, 'post_id' | 'user_id' | 'type'>
        Update: Partial<PostInteraction>
      }
      comments: {
        Row: Comment
        Insert: Partial<Comment> & Pick<Comment, 'post_id' | 'user_id' | 'body'>
        Update: Partial<Comment>
      }
      notification_log: {
        Row: NotificationLog
        Insert: Partial<NotificationLog> & Pick<NotificationLog, 'user_id' | 'type'>
        Update: Partial<NotificationLog>
      }
      taste_signals: {
        Row: TasteSignal
        Insert: Partial<TasteSignal> & Pick<TasteSignal, 'user_id' | 'signal_type'>
        Update: Partial<TasteSignal>
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
