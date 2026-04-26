import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// The ID you provided: '754860ce-7aa8-4b92-8eaa-59f6699c4615'
const userIdToDelete = process.argv[2] || '754860ce-7aa8-4b92-8eaa-59f6699c4615'

async function deleteUser() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log(`Attempting to delete user with ID: ${userIdToDelete}...`)
  
  // 1. Manually clean up tables that lack ON DELETE CASCADE
  console.log('Cleaning up bookings and crisis logs...')
  await supabase.from('bookings').delete().or(`student_id.eq.${userIdToDelete},counselor_id.eq.${userIdToDelete}`)
  await supabase.from('crisis_logs').delete().or(`student_id.eq.${userIdToDelete},counselor_id.eq.${userIdToDelete}`)
  
  // 2. Use admin.deleteUser to remove from auth.users
  // This will remove the profile and other cascaded tables (mood_logs, chat_sessions, etc.)
  const { error } = await supabase.auth.admin.deleteUser(userIdToDelete)

  if (error) {
    console.error('Failed to delete user:', error.message)
    return
  }

  console.log('Successfully deleted user and all associated data.')
}

deleteUser().catch(err => {
  console.error('Unexpected error:', err)
})
