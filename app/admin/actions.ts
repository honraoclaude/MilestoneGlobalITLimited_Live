'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { updateStatus } from '@/lib/db'

export async function updateLeadStatus(id: number, status: string) {
  updateStatus(id, status)
  revalidatePath('/admin')
}

export async function logout() {
  const store = await cookies()
  store.delete('admin_auth')
  redirect('/admin/login')
}
