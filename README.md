# Drape

## Supabase setup

1. Create a new project in [Supabase](https://supabase.com/dashboard).
2. Open the project's SQL Editor and run
   `supabase/migrations/20260901000000_init.sql`.
3. Copy the project URL and anon key from the project's API settings into
   `.env.local`:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. In Authentication > Providers, enable the Email provider.
5. For local development, disable email confirmations so a new signup can
   proceed directly to the dashboard.
6. Run `supabase/migrations/20260904000000_catalog_storage.sql` in the SQL
   Editor to create the public `catalog` storage bucket and its policies.

Install dependencies with `npm install`, then start the app with `npm run dev`.
