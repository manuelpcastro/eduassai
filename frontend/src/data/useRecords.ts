import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { useAuth, type AuthState } from '../auth/AuthContext'
import { API_URL, supabase } from '../lib/supabase'
import {
  apiStore,
  countDeviceRecords,
  deviceStore,
  moveDeviceRecords,
  type Collection,
  type RecordStore,
  type StoredRecord,
} from './records'

export type RecordsStatus = 'loading' | 'ready' | 'error'

interface Snapshot<T> {
  status: RecordsStatus
  items: T[]
}

interface Entry<T extends StoredRecord> {
  store: RecordStore<T>
  snapshot: Snapshot<T>
  listeners: Set<() => void>
}

/**
 * Loaded collections, keyed by "<device|userId>:<module>/<kind>", so every
 * component showing the same collection shares one copy and one request.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new Map<string, Entry<any>>()

/** Forget everything loaded, e.g. on sign-out so the next user never sees it. */
export function clearRecordCache() {
  cache.clear()
}

function setSnapshot<T extends StoredRecord>(entry: Entry<T>, snapshot: Snapshot<T>) {
  entry.snapshot = snapshot
  entry.listeners.forEach((l) => l())
}

async function load<T extends StoredRecord>(entry: Entry<T>) {
  try {
    setSnapshot(entry, { status: 'ready', items: await entry.store.list() })
  } catch {
    setSnapshot(entry, { status: 'error', items: entry.snapshot.items })
  }
}

function entryFor<T extends StoredRecord>(key: string, store: RecordStore<T>): Entry<T> {
  let entry = cache.get(key) as Entry<T> | undefined
  if (!entry) {
    entry = { store, snapshot: { status: 'loading', items: [] }, listeners: new Set() }
    cache.set(key, entry)
    void load(entry)
  }
  return entry
}

type Target<T extends StoredRecord> =
  | { kind: 'waiting'; snapshot: Snapshot<T> }
  | { kind: 'store'; key: string; store: RecordStore<T> }

const LOADING: Snapshot<never> = { status: 'loading', items: [] }

async function accessToken(): Promise<string> {
  const { data } = await supabase!.auth.getSession()
  if (!data.session) throw new Error('Not signed in')
  return data.session.access_token
}

/** Signed in: the account. Otherwise (accounts are optional): this device. */
function resolveTarget<T extends StoredRecord>(auth: AuthState, c: Collection): Target<T> {
  const path = `${c.module}/${c.kind}`
  if (auth.enabled && auth.loading) return { kind: 'waiting', snapshot: LOADING }
  if (auth.enabled && auth.user && supabase && API_URL) {
    return { kind: 'store', key: `${auth.user.id}:${path}`, store: apiStore<T>(API_URL, accessToken, c) }
  }
  return { kind: 'store', key: `device:${path}`, store: deviceStore<T>(c) }
}

export interface RecordsState<T extends StoredRecord> extends Snapshot<T> {
  save: (record: T) => Promise<void>
  remove: (id: string) => Promise<void>
  /** True when records are saved in the signed-in user's account rather than this device. */
  inAccount: boolean
  /** When signed in: records still saved on this device, which can be moved to the account. */
  deviceCount: number
  moveDeviceRecordsToAccount: () => Promise<void>
}

/** The current user's records in a collection, kept in sync across components. */
export function useRecords<T extends StoredRecord>(collection: Collection): RecordsState<T> {
  const auth = useAuth()
  const { module, kind, deviceKey } = collection
  const target = useMemo(
    () => resolveTarget<T>(auth, { module, kind, deviceKey }),
    // Only these parts of auth decide where records live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [auth.enabled, auth.loading, auth.user?.id, module, kind, deviceKey],
  )

  const subscribe = useCallback(
    (listener: () => void) => {
      if (target.kind !== 'store') return () => {}
      const entry = entryFor(target.key, target.store)
      entry.listeners.add(listener)
      return () => entry.listeners.delete(listener)
    },
    [target],
  )
  const getSnapshot = useCallback(
    () => (target.kind === 'store' ? entryFor(target.key, target.store).snapshot : target.snapshot),
    [target],
  )
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const withEntry = useCallback(
    async (action: (entry: Entry<T>) => Promise<void>) => {
      if (target.kind !== 'store') throw new Error('Still checking the session')
      const entry = entryFor(target.key, target.store)
      await action(entry)
      await load(entry)
    },
    [target],
  )

  const inAccount = auth.enabled && auth.user !== null && target.kind === 'store'
  return {
    ...snapshot,
    inAccount,
    save: (record) => withEntry((e) => e.store.save(record)),
    remove: (id) => withEntry((e) => e.store.remove(id)),
    deviceCount: inAccount ? countDeviceRecords(collection) : 0,
    moveDeviceRecordsToAccount: () => withEntry((e) => moveDeviceRecords(collection, e.store)),
  }
}
