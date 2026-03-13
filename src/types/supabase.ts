// Supabase generated types (ensure phone auth compatible)
export type Tables = {
  // profiles table (link to auth.users.id)
  profiles: {
    Row: {
      id: string
      full_name: string | null
      phone: string | null
      category: string
      // add user_id uuid REFERENCES auth.users(id) if not exists
    }
  }
  // other tables...
}

export type Profile = Tables['profiles']['Row'];

