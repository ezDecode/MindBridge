-- Migration 015: Enable Realtime and Booking-based Permissions for Direct Messages

-- 1. Ensure Realtime is enabled for direct_messages
do $$ 
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' 
    and schemaname = 'public' 
    and tablename = 'direct_messages'
  ) then
    alter publication supabase_realtime add table direct_messages;
  end if;
exception 
  when others then null;
end $$;

-- 2. Add a policy to ensure messages can only be sent if a booking exists (optional but safer)
-- For simplicity in this iteration, we keep the existing participants policy but add a helper function
-- to check if two users have a valid booking context.

create or replace function public.can_chat_with(target_user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from bookings
    where (
      (user_id = auth.uid() and counselor_id = target_user_id)
      or (user_id = target_user_id and counselor_id = auth.uid())
    )
    and status in ('confirmed', 'pending_confirmation')
    -- Optional: Limit to within 24 hours of a booking
    -- and (slot_start > now() - interval '24 hours')
  );
end;
$$ language plpgsql security definer;

-- 3. Add index for faster lookups
create index if not exists idx_direct_messages_conversation 
on direct_messages(sender_id, receiver_id, created_at asc);
