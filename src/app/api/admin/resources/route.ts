import { createServiceClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth/user';

export async function GET() {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createServiceClient();
    const { data: resources, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(resources || []);
  } catch (error) {
    console.error('Admin Resources API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthUser()
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = await createServiceClient();

    const { data: resource, error } = await supabase
      .from('resources')
      .insert(body)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(resource);
  } catch (error) {
    console.error('Admin Resources POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
