import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

async function assignRoles() {
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const assignments = [
    { id: '3637facd-6ebe-4202-85d4-f130f17cf8f0', role: 'admin' },
    { id: '0d6448f7-841c-4c2d-9418-54f4b93beba1', role: 'counselor' }
  ]

  for (const { id, role } of assignments) {
    console.log(`Assigning ${role} role to user ${id}...`)

    // 1. Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)

    if (profileError) {
      console.error(`Failed to update profile for ${id}:`, profileError.message)
    } else {
      console.log(`Profile updated successfully for ${id}.`)
    }

    // 2. Update auth.users metadata
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      user_metadata: { role }
    })

    if (authError) {
      console.error(`Failed to update auth metadata for ${id}:`, authError.message)
    } else {
      console.log(`Auth metadata updated successfully for ${id}.`)
    }
  }

  console.log('Done.')
}

assignRoles().catch(err => console.error(err))
