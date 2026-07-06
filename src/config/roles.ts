export const ADMIN_EMAIL = 'manuonda@gmail.com'

export function isAdminEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase() === ADMIN_EMAIL
}

export function isOrganizerOf(
  tournament: { createdBy: string } | null | undefined,
  uid: string | null | undefined,
): boolean {
  return !!uid && !!tournament && tournament.createdBy === uid
}
