/**
 * Photos never leave the device: they are kept in this browser's storage and
 * records (even those saved to an account) only hold the photo's id.
 * On another device the id simply isn't found.
 */
const PREFIX = 'eduassai.photo.'

/** Stores a photo (a data URL) and returns its id. Throws if storage is full. */
export function savePhoto(dataUrl: string): string {
  const id = crypto.randomUUID()
  localStorage.setItem(PREFIX + id, dataUrl)
  return id
}

export function getPhoto(id: string): string | null {
  try {
    return localStorage.getItem(PREFIX + id)
  } catch {
    return null
  }
}

export function deletePhoto(id: string) {
  try {
    localStorage.removeItem(PREFIX + id)
  } catch {
    // Ignore.
  }
}
