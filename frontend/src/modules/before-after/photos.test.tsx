import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { deviceStore, moveDeviceRecords, type RecordStore } from '../../data/records'
import { getPhoto, savePhoto } from '../../lib/photos'
import { PictureView } from './PictureView'
import { SITUATIONS, type CustomScenario } from './situations'

describe('device-only photos', () => {
  it('shows a stored photo, and a placeholder when it is on another device', () => {
    const photoId = savePhoto('data:image/jpeg;base64,AAAA')
    const { container, rerender } = render(<PictureView picture={{ kind: 'photo', photoId }} />)
    expect(container.querySelector('img')).toHaveAttribute('src', 'data:image/jpeg;base64,AAAA')

    rerender(<PictureView picture={{ kind: 'photo', photoId: crypto.randomUUID() }} />)
    expect(container.querySelector('img')).toBeNull()
    expect(container).toHaveTextContent('📷')
  })

  it('keeps inline photos on the device when moving situations to an account', async () => {
    await deviceStore<CustomScenario>(SITUATIONS).save({
      id: 'legacy',
      title: 'Vieja',
      before: { text: 'Antes', picture: { kind: 'photo', src: 'data:image/jpeg;base64,BBBB' } },
      after: { text: 'Después', picture: { kind: 'arasaac', id: 5 } },
    })
    const uploaded: CustomScenario[] = []
    const account: RecordStore<CustomScenario> = {
      list: async () => uploaded,
      save: async (s) => void uploaded.push(s),
      remove: async () => {},
    }

    await moveDeviceRecords(SITUATIONS, account)

    const picture = uploaded[0].before.picture
    expect(JSON.stringify(uploaded)).not.toContain('data:image')
    expect(picture.kind === 'photo' && 'photoId' in picture && getPhoto(picture.photoId)).toBe(
      'data:image/jpeg;base64,BBBB',
    )
  })
})
