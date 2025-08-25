// import { createClient } from '@supabase/supabase-js'

// export function supabaseAdmin() {
//   const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
//   const key = process.env.SUPABASE_SERVICE_ROLE!
//   return createClient(url, key, { auth: { persistSession: false } })
// }

import { createClient } from '@supabase/supabase-js'

export const supabaseServer = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
