import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth/user'

export async function GET() {
    try {
        const user = await getAuthUser()
        
        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createServiceClient()
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        return NextResponse.json(profiles || [])
    } catch (error) {
        console.error('Admin Users API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
