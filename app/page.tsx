// Lokasi File: app/page.tsx

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Page() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()

  // Logika pengalihan (redirect)
  if (user) {
    // Jika ada pengguna yang login, arahkan ke dashboard
    return redirect('/dashboard')
  }

  // Jika tidak ada pengguna, arahkan ke halaman login
  return redirect('/login')
}