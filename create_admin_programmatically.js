import { createClient } from '@supabase/supabase-js';

const url = "https://cjkmlpoxtcokyqyllzhf.supabase.co";
const service_role_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqa21scG94dGNva3lxeWxsemhmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjM5NDM1MCwiZXhwIjoyMDk3OTcwMzUwfQ.w1A7AQNCwZy6vfaHS_pLPB9UAZ4uXYs96GYagJesZwg";

const supabase = createClient(url, service_role_key);

async function main() {
  try {
    // 1. Purge any duplicate profiles
    console.log("Purging any conflicting public profile...");
    await supabase.from('users').delete().eq('email', 'admin@hampbox.com');

    // 2. Create the admin user programmatically via the Admin Auth API
    console.log("Creating admin user admin@hampbox.com...");
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@hampbox.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        full_name: 'Jane Admin'
      }
    });

    if (error) {
      console.error("Auth Admin Create Error:", error.message, "status:", error.status);
    } else {
      console.log("Auth Admin user created successfully! ID:", data.user.id);

      // 3. Elevate to Admin in public.users
      console.log("Elevating user to is_admin = true...");
      const { error: dbErr } = await supabase
        .from('users')
        .update({ is_admin: true })
        .eq('user_id', data.user.id);

      if (dbErr) {
        console.error("Database Update Error:", dbErr.message);
      } else {
        console.log("User successfully elevated to Administrator!");
      }
    }
  } catch (err) {
    console.error("Failure:", err);
  }
}

main();
