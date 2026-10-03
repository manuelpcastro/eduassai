import { describe, expect, it, vi } from 'vitest'
import { apiStore, deviceStore, moveDeviceRecords, type Collection, type RecordStore } from './records'

interface Note {
  id: string
  text: string
}

const NOTES: Collection = { module: 'test', kind: 'note' }

describe('apiStore', () => {
  it('sends the token and maps records to and from the API', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (!init?.method) {
        return Response.json({ records: [{ id: 'a', data: { text: 'hola' }, createdAt: 'x' }] })
      }
      return new Response(null, { status: init.method === 'DELETE' ? 204 : 200 })
    })
    vi.stubGlobal('fetch', fetchMock)
    const store = apiStore<Note>('https://api.test', async () => 'tok', NOTES)

    expect(await store.list()).toEqual([{ id: 'a', text: 'hola' }])
    await store.save({ id: 'b', text: 'adiós' })
    await store.remove('b')

    const [listCall, saveCall, deleteCall] = fetchMock.mock.calls
    expect(listCall[0]).toBe('https://api.test/v1/records/test/note')
    expect((listCall[1]!.headers as Record<string, string>).Authorization).toBe('Bearer tok')
    expect(saveCall[0]).toBe('https://api.test/v1/records/test/note/b')
    expect(saveCall[1]).toMatchObject({ method: 'PUT', body: JSON.stringify({ data: { text: 'adiós' } }) })
    expect(deleteCall[1]).toMatchObject({ method: 'DELETE' })
  })

  it('reports failed requests', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 500 })))
    const store = apiStore<Note>('https://api.test', async () => 'tok', NOTES)
    await expect(store.list()).rejects.toMatchObject({ status: 500 })
  })
})

describe('moveDeviceRecords', () => {
  it('copies device records into the account and clears them locally', async () => {
    await deviceStore<Note>(NOTES).save({ id: 'old-1', text: 'uno' })
    const saved: Note[] = []
    const account: RecordStore<Note> = {
      list: async () => saved,
      save: async (n) => void saved.push(n),
      remove: async () => {},
    }

    await moveDeviceRecords(NOTES, account)

    expect(saved).toHaveLength(1)
    expect(saved[0].text).toBe('uno')
    expect(saved[0].id).not.toBe('old-1')
    expect(await deviceStore<Note>(NOTES).list()).toEqual([])
  })
})
