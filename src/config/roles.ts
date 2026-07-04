export const ADMIN_EMAIL = 'manuonda@gmail.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL
}
