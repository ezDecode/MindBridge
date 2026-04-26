import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function listUsers() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  console.log('Fetching users and profiles...')
  
  const [authRes, profileRes] = await Promise.all([
    supabase.auth.admin.listUsers(),
    supabase.from('profiles').select('*')
  ])

  if (authRes.error) {
    console.error('Failed to fetch auth users:', authRes.error.message)
    return
  }

  const users = authRes.data.users
  const profiles = profileRes.data || []

  const combined = users.map(user => {
    const profile = profiles.find(p => p.id === user.id)
    return {
      id: user.id,
      email: user.email,
      provider: user.app_metadata.provider,
      name: profile?.name || user.user_metadata.full_name || 'N/A',
      profile_role: profile?.role || 'NULL',
      auth_metadata_role: user.user_metadata.role || 'Not Set',
      xp: profile?.xp || 0,
      last_login: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'
    }
  })

  console.table(combined)
}

listUsers().catch(err => console.error(err))
