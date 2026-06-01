'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { checkRateLimit } from '@/lib/rate-limit'

export async function login(_: unknown, formData: FormData) {
  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0].trim() ??
    headersList.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(`login:${ip}`, 5, 900).allowed) {
    return { error: 'Too many login attempts. Please try again later.' }
  }

  const password = formData.get('password') as string
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return { error: 'Incorrect password' }
  }

  const store = await cookies()
  store.set('admin_auth', process.env.ADMIN_SECRET!, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  redirect('/admin')
}
