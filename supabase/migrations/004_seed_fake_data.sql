-- ============================================
-- FAKE SEED DATA MIGRATION
-- Indian Counselors & Students
-- Note: These bypass the auth.users requirement via dummy insertion 
-- purely for demo/report purposes.
-- ============================================

DO $$
DECLARE
    -- Counselor UUIDs
    c_radha uuid := gen_random_uuid();
    c_vikram uuid := gen_random_uuid();
    c_sneha uuid := gen_random_uuid();
    c_arjun uuid := gen_random_uuid();
    c_pooja uuid := gen_random_uuid();

    -- Student UUIDs
    s_rohan uuid;
    s_anjali uuid;
    s_karan uuid;
    s_priya uuid;
    
    i int;
BEGIN

    -- 1. Create Fake Auth Users & Profiles for Counselors
    INSERT INTO auth.users (id, role, email, encrypted_password, raw_user_meta_data)
    VALUES 
        (c_radha, 'authenticated', 'radha.sharma@mindbridge.in', 'dummy', '{"name": "Dr. Radha Sharma", "role": "counselor"}'),
        (c_vikram, 'authenticated', 'vikram.singh@mindbridge.in', 'dummy', '{"name": "Dr. Vikram Singh", "role": "counselor"}'),
        (c_sneha, 'authenticated', 'sneha.patel@mindbridge.in', 'dummy', '{"name": "Dr. Sneha Patel", "role": "counselor"}'),
        (c_arjun, 'authenticated', 'arjun.desai@mindbridge.in', 'dummy', '{"name": "Dr. Arjun Desai", "role": "counselor"}'),
        (c_pooja, 'authenticated', 'pooja.iyer@mindbridge.in', 'dummy', '{"name": "Dr. Pooja Iyer", "role": "counselor"}');

    -- Insert 5 more counselors
    FOR i IN 1..5 LOOP
        INSERT INTO auth.users (id, role, email, encrypted_password, raw_user_meta_data)
        VALUES (gen_random_uuid(), 'authenticated', 'counselor' || i || '@mindbridge.in', 'dummy', 
                ('{"name": "Counselor ' || i || '", "role": "counselor"}')::jsonb);
    END LOOP;

    -- 2. Create Fake Auth Users & Profiles for 40 Students
    FOR i IN 1..40 LOOP
        s_rohan := gen_random_uuid();
        
        -- Distribute students randomly among the 5 main counselors
        INSERT INTO auth.users (id, role, email, encrypted_password, raw_user_meta_data)
        VALUES (s_rohan, 'authenticated', 'student' || i || '@university.edu.in', 'dummy', 
                ('{"name": "Student ' || i || '", "role": "student"}')::jsonb);
        
        -- The trigger "on_auth_user_created" will create the profile. We just need to update counselor_id!
        UPDATE public.profiles 
        SET counselor_id = CASE (i % 5)
                            WHEN 0 THEN c_radha
                            WHEN 1 THEN c_vikram
                            WHEN 2 THEN c_sneha
                            WHEN 3 THEN c_arjun
                            ELSE c_pooja
                           END,
            institution = 'Delhi University'
        WHERE id = s_rohan;

        -- 3. Create Fake Mood Logs for each student (Last 7 days)
        INSERT INTO public.mood_logs (user_id, score, note, logged_at)
        VALUES 
            (s_rohan, floor(random() * 5 + 1), 'Feeling okay today', now() - interval '1 day'),
            (s_rohan, floor(random() * 5 + 1), 'A bit stressed with exams', now() - interval '3 days'),
            (s_rohan, floor(random() * 3 + 1), 'Tired', now() - interval '5 days');

        -- 4. Create Fake Appointments (Pending and Confirmed)
        IF i % 4 = 0 THEN
            INSERT INTO public.bookings (student_id, counselor_id, slot_start, slot_end, type, status)
            VALUES (
                s_rohan, 
                (SELECT counselor_id FROM public.profiles WHERE id = s_rohan), 
                now() + interval '1 day', 
                now() + interval '1 day 1 hour', 
                'named', 
                'pending_confirmation'
            );
        END IF;

    END LOOP;

    -- 5. Trigger a fake Crisis Log for Admin/Counselor Dashboard proof
    INSERT INTO public.crisis_logs (student_id, counselor_id, severity, acknowledged, triggered_at)
    VALUES 
        ((SELECT id FROM public.profiles WHERE role = 'student' LIMIT 1), c_radha, 'high', false, now() - interval '2 hours'),
        ((SELECT id FROM public.profiles WHERE role = 'student' OFFSET 1 LIMIT 1), c_vikram, 'severe', true, now() - interval '1 day');

END $$;