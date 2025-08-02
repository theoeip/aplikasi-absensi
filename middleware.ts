// Lokasi File: middleware.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Buat response awal yang akan kita modifikasi
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Buat Supabase client yang khusus untuk middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Ambil data pengguna. Ini juga me-refresh session.
  const { data: { user } } = await supabase.auth.getUser()

  // ==========================================================
  // LOGIKA PENGALIHAN (REDIRECT) ANDA DIMASUKKAN DI SINI
  // ==========================================================
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  const userRole = user?.user_metadata?.role;
  const isAdmin = userRole === 'SuperAdmin' || userRole === 'AdminSMP' || userRole === 'AdminSMK';

  // 1. Jika pengguna belum login dan tidak berada di halaman login, alihkan ke login.
  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Jika pengguna sudah login dan mencoba mengakses halaman login, alihkan ke halaman yang sesuai.
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL(isAdmin ? '/admin/users' : '/dashboard', request.url));
  }

  // 3. Jika pengguna bukan admin tetapi mencoba mengakses halaman admin, alihkan ke dashboard.
  if (user && !isAdmin && request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  // ==========================================================

  // Kembalikan response yang sudah diperbarui dengan cookies (jika ada)
  return response;
}

// Konfigurasi matcher untuk menentukan path mana yang akan dijalankan oleh middleware
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};