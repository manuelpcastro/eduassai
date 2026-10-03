/**
 * Generic persistence for module data. A module declares a collection, e.g.
 * `{ module: 'beforeAfter', kind: 'situation' }`, and gets its records from the
 * signed-in user's account (through the EduAssAI API) or, when nobody is signed
 * in, from this browser's localStorage. The API must know the collection too
 * (backend/src/collections.ts), which validates what gets stored.
 */
export interface Collection {
  module: string
  kind: string
  /** localStorage key used in device mode. Defaults to eduassai.records.<module>.<kind>. */
  deviceKey?: string
}

export interface StoredRecord {
  id: string
}

export interface RecordStore<T extends StoredRecord> {
  list(): Promise<T[]>
  /** Adds the record, or replaces the one with the same id. */
  save(record: T): Promise<void>
  remove(id: string): Promise<void>
}

export function newRecordId(): string {
  return crypto.randomUUID()
}

// ---------- Device (no account) ----------

function deviceKey(c: Collection) {
  return c.deviceKey ?? `eduassai.records.${c.module}.${c.kind}`
}

function readDevice<T>(c: Collection): T[] {
  try {
    const raw = localStorage.getItem(deviceKey(c))
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

function writeDevice<T>(c: Collection, list: T[]) {
  // Throws when storage is full; callers show a message.
  if (list.length === 0) localStorage.removeItem(deviceKey(c))
  else localStorage.setItem(deviceKey(c), JSON.stringify(list))
}

export function deviceStore<T extends StoredRecord>(c: Collection): RecordStore<T> {
  return {
    async list() {
      return readDevice<T>(c)
    },
    async save(record) {
      const list = readDevice<T>(c)
      const exists = list.some((r) => r.id === record.id)
      writeDevice(c, exists ? list.map((r) => (r.id === record.id ? record : r)) : [...list, record])
    },
    async remove(id) {
      writeDevice(
        c,
        readDevice<T>(c).filter((r) => r.id !== id),
      )
    },
  }
}

// ---------- Account (EduAssAI API) ----------

export class ApiError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`API request failed: ${status}`)
    this.status = status
  }
}

interface ApiRecord {
  id: string
  data: Record<string, unknown>
}

/**
 * @param getToken returns the signed-in user's access token for each request.
 */
export function apiStore<T extends StoredRecord>(
  apiUrl: string,
  getToken: () => Promise<string>,
  c: Collection,
): RecordStore<T> {
  const base = `${apiUrl}/v1/records/${encodeURIComponent(c.module)}/${encodeURIComponent(c.kind)}`

  async function request(path: string, init: RequestInit = {}) {
    const res = await fetch(`${base}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${await getToken()}`,
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    })
    if (!res.ok) throw new ApiError(res.status)
    return res
  }

  return {
    async list() {
      const { records } = (await (await request('')).json()) as { records: ApiRecord[] }
      return records.map((r) => ({ ...r.data, id: r.id }) as T)
    },
    async save(record) {
      const { id, ...data } = record
      await request(`/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ data }) })
    },
    async remove(id) {
      await request(`/${encodeURIComponent(id)}`, { method: 'DELETE' })
    },
  }
}

// ---------- Device -> account ----------

export function countDeviceRecords(c: Collection): number {
  return readDevice(c).length
}

/** Copies the records saved on this device into `target` and removes them locally. */
export async function moveDeviceRecords<T extends StoredRecord>(c: Collection, target: RecordStore<T>) {
  const device = deviceStore<T>(c)
  for (const record of await device.list()) {
    // Fresh ids: older device records may not be UUIDs.
    await target.save({ ...record, id: newRecordId() })
    await device.remove(record.id)
  }
}
