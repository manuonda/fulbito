const KEY = 'fulbito:returnTo'

/** Recuerda a dónde quería ir el usuario antes de mandarlo a loguearse. */
export function rememberReturnTo(pathname: string) {
  sessionStorage.setItem(KEY, pathname)
}

/** Devuelve el destino recordado (y lo borra) o el fallback si no hay ninguno. */
export function consumeReturnTo(fallback: string): string {
  const value = sessionStorage.getItem(KEY)
  if (value) sessionStorage.removeItem(KEY)
  return value || fallback
}
