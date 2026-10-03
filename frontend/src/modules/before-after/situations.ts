import { useRecords } from '../../data/useRecords'
import type { Collection } from '../../data/records'
import { savePhoto } from '../../lib/photos'
import type { Picture, PlayableScenario } from './types'

/** A situation made by a parent or teacher. */
export type CustomScenario = PlayableScenario

export const SITUATIONS: Collection = {
  module: 'beforeAfter',
  kind: 'situation',
  // Where situations were kept before accounts existed.
  deviceKey: 'eduassai.beforeAfter.custom',
  prepareForAccount: (s: CustomScenario): CustomScenario => ({
    ...s,
    before: { ...s.before, picture: keepPhotoOnDevice(s.before.picture) },
    after: { ...s.after, picture: keepPhotoOnDevice(s.after.picture) },
  }),
}

/** Older situations kept photos inline; move them to the device photo store. */
function keepPhotoOnDevice(picture: Picture): Picture {
  return picture.kind === 'photo' && 'src' in picture ? { kind: 'photo', photoId: savePhoto(picture.src) } : picture
}

export function useSituations() {
  return useRecords<CustomScenario>(SITUATIONS)
}
