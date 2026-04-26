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
 profiles: {
 Row: {
 id: string
 name: string | null
 role: 'student' | 'counselor' | 'admin'
 institution: string | null
 counselor_id: string | null
 created_at: string
 xp: number
 }
 Insert: {
 id: string
 name?: string | null
 role: 'student' | 'counselor' | 'admin'
 institution?: string | null
 counselor_id?: string | null
 created_at?: string
 xp?: number
 }
 Update: {
 id?: string
 name?: string | null
 role?: 'student' | 'counselor' | 'admin'
 institution?: string | null
 counselor_id?: string | null
 created_at?: string
 xp?: number
 }
 Relationships: [
 {
 foreignKeyName: 'profiles_counselor_id_fkey'
 columns: ['counselor_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 }
 ]
 }
 mood_logs: {
 Row: {
 id: string
 user_id: string
 score: number
 note: string | null
 logged_at: string
 }
 Insert: {
 id?: string
 user_id: string
 score: number
 note?: string | null
 logged_at?: string
 }
 Update: {
 id?: string
 user_id?: string
 score?: number
 note?: string | null
 logged_at?: string
 }
 Relationships: [
 {
 foreignKeyName: 'mood_logs_user_id_fkey'
 columns: ['user_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 }
 ]
 }
 chat_sessions: {
 Row: {
 id: string
 user_id: string
 title: string | null
 created_at: string
 last_message_at: string
 }
 Insert: {
 id?: string
 user_id: string
 title?: string | null
 created_at?: string
 last_message_at?: string
 }
 Update: {
 id?: string
 user_id?: string
 title?: string | null
 created_at?: string
 last_message_at?: string
 }
 Relationships: [
 {
 foreignKeyName: 'chat_sessions_user_id_fkey'
 columns: ['user_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 }
 ]
 }
 chat_messages: {
 Row: {
 id: string
 user_id: string
 session_id: string
 role: 'user' | 'assistant'
 content: string
 crisis_flag: boolean
 proactive: boolean
 sent_at: string
 }
 Insert: {
 id?: string
 user_id: string
 session_id: string
 role: 'user' | 'assistant'
 content: string
 crisis_flag?: boolean
 proactive?: boolean
 sent_at?: string
 }
 Update: {
 id?: string
 user_id?: string
 session_id?: string
 role?: 'user' | 'assistant'
 content?: string
 crisis_flag?: boolean
 proactive?: boolean
 sent_at?: string
 }
 Relationships: [
 {
 foreignKeyName: 'chat_messages_user_id_fkey'
 columns: ['user_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 },
 {
 foreignKeyName: 'chat_messages_session_id_fkey'
 columns: ['session_id']
 referencedRelation: 'chat_sessions'
 referencedColumns: ['id']
 }
 ]
 }
 assessments: {
 Row: {
 id: string
 user_id: string
 criteria_flagged: string[]
 severity: 'none' | 'mild' | 'moderate' | 'severe'
 assessed_at: string
 }
 Insert: {
 id?: string
 user_id: string
 criteria_flagged?: string[]
 severity?: 'none' | 'mild' | 'moderate' | 'severe'
 assessed_at?: string
 }
 Update: {
 id?: string
 user_id?: string
 criteria_flagged?: string[]
 severity?: 'none' | 'mild' | 'moderate' | 'severe'
 assessed_at?: string
 }
 Relationships: [
 {
 foreignKeyName: 'assessments_user_id_fkey'
 columns: ['user_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 }
 ]
 }
 counselor_slots: {
 Row: {
 id: string
 counselor_id: string
 slot_start: string
 slot_end: string
 available: boolean
 held_until: string | null
 }
 Insert: {
 id?: string
 counselor_id: string
 slot_start: string
 slot_end: string
 available?: boolean
 held_until?: string | null
 }
 Update: {
 id?: string
 counselor_id?: string
 slot_start?: string
 slot_end?: string
 available?: boolean
 held_until?: string | null
 }
 Relationships: [
 {
 foreignKeyName: 'counselor_slots_counselor_id_fkey'
 columns: ['counselor_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 }
 ]
 }
 bookings: {
 Row: {
 id: string
 student_id: string
 counselor_id: string
 slot_id: string | null
 slot_start: string
 slot_end: string
 type: 'anonymous' | 'named' | 'crisis'
 status: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed'
 notes_encrypted: string | null
 created_at: string
 }
 Insert: {
 id?: string
 student_id: string
 counselor_id: string
 slot_id?: string | null
 slot_start: string
 slot_end: string
 type: 'anonymous' | 'named' | 'crisis'
 status?: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed'
 notes_encrypted?: string | null
 created_at?: string
 }
 Update: {
 id?: string
 student_id?: string
 counselor_id?: string
 slot_id?: string | null
 slot_start?: string
 slot_end?: string
 type?: 'anonymous' | 'named' | 'crisis'
 status?: 'pending_confirmation' | 'confirmed' | 'cancelled' | 'completed'
 notes_encrypted?: string | null
 created_at?: string
 }
 Relationships: [
 {
 foreignKeyName: 'bookings_student_id_fkey'
 columns: ['student_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 },
 {
 foreignKeyName: 'bookings_counselor_id_fkey'
 columns: ['counselor_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 },
 {
 foreignKeyName: 'bookings_slot_id_fkey'
 columns: ['slot_id']
 referencedRelation: 'counselor_slots'
 referencedColumns: ['id']
 }
 ]
 }
 user_core_memories: {
  Row: {
  user_id: string
  summary_text: string
  message_count: number
  last_compressed_at: string
  last_compressed_message_at: string | null
  }
  Insert: {
  user_id: string
  summary_text?: string
  message_count?: number
  last_compressed_at?: string
  last_compressed_message_at?: string | null
  }
  Update: {
  user_id?: string
  summary_text?: string
  message_count?: number
  last_compressed_at?: string
  last_compressed_message_at?: string | null
  }
  Relationships: [
  {
  foreignKeyName: 'user_core_memories_user_id_fkey'
  columns: ['user_id']
  referencedRelation: 'profiles'
  referencedColumns: ['id']
  }
  ]
  }
 crisis_logs: {
  Row: {
  id: string
  student_id: string
  counselor_id: string
  severity: string
  acknowledged: boolean
  triggered_at: string
  }
 Insert: {
 id?: string
 student_id: string
 counselor_id: string
 severity: string
 acknowledged?: boolean
 triggered_at?: string
 }
 Update: {
 id?: string
 student_id?: string
 counselor_id?: string
 severity?: string
 acknowledged?: boolean
 triggered_at?: string
 }
 Relationships: [
 {
 foreignKeyName: 'crisis_logs_student_id_fkey'
 columns: ['student_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 },
 {
 foreignKeyName: 'crisis_logs_counselor_id_fkey'
 columns: ['counselor_id']
 referencedRelation: 'profiles'
 referencedColumns: ['id']
 }
 ]
 }
 wellness_resources: {
  Row: {
  id: string
  title: string
  description: string | null
  link: string | null
  type: string
  category: string
  image_url: string | null
  created_at: string
  }
  Insert: {
  id?: string
  title: string
  description?: string | null
  link?: string | null
  type: string
  category: string
  image_url?: string | null
  created_at?: string
  }
  Update: {
  id?: string
  title?: string
  description?: string | null
  link?: string | null
  type?: string
  category?: string
  image_url?: string | null
  created_at?: string
  }
  Relationships: []
  }
 }
 Views: {
 [_ in never]: never
 }
 Functions: {
  increment_xp: {
  Args: {
  user_id: string
  amount: number
  }
  Returns: undefined
  }
 }
 Enums: {
 [_ in never]: never
 }
 }
}

// Helper types for easy access
export type Profile = Database['public']['Tables']['profiles']['Row']
export type MoodLog = Database['public']['Tables']['mood_logs']['Row']
export type ChatSession = Database['public']['Tables']['chat_sessions']['Row']
export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Assessment = Database['public']['Tables']['assessments']['Row']
export type CounselorSlot = Database['public']['Tables']['counselor_slots']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type CrisisLog = Database['public']['Tables']['crisis_logs']['Row']

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type MoodLogInsert = Database['public']['Tables']['mood_logs']['Insert']
export type ChatSessionInsert = Database['public']['Tables']['chat_sessions']['Insert']
export type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert']
export type BookingInsert = Database['public']['Tables']['bookings']['Insert']
