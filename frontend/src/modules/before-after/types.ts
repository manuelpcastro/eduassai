/** How a card's picture is stored. */
export type Picture =
  | { kind: 'emoji'; emoji: string }
  /** A specific ARASAAC pictogram. */
  | { kind: 'arasaac'; id: number }
  /** Look up an ARASAAC pictogram by keyword; show the emoji if none is found. */
  | { kind: 'arasaacSearch'; keywords: readonly string[]; emoji: string }
  /** A photo kept only on this device (src/lib/photos.ts); never uploaded. */
  | { kind: 'photo'; photoId: string }
  /** Older device-only format with the photo inline. Still shown; never uploaded. */
  | { kind: 'photo'; src: string }

export interface PlayableStep {
  text: string
  picture: Picture
}

/** Everything the game needs, already translated. */
export interface PlayableScenario {
  id: string
  title: string
  before: PlayableStep
  after: PlayableStep
}

/** Ids of the device photos a scenario uses. */
export function photoIds(s: Pick<PlayableScenario, 'before' | 'after'>): string[] {
  return [s.before.picture, s.after.picture].flatMap((p) => (p.kind === 'photo' && 'photoId' in p ? [p.photoId] : []))
}
