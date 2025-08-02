// utils/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Fungsi ini SEKARANG MENERIMA cookieStore sebagai argumen
export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Ini terjadi jika 'set' dipanggil dari Server Component.
            // Bisa diabaikan jika Anda memiliki middleware yang me-refresh sesi.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Ini terjadi jika 'remove' dipanggil dari Server Component.
            // Bisa diabaikan jika Anda memiliki middleware yang me-refresh sesi.
          }
        },
      },
    }
  )
}