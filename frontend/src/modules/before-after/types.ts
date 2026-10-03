/** How a card's picture is stored. */
export type Picture =
  | { kind: 'emoji'; emoji: string }
  /** A specific ARASAAC pictogram. */
  | { kind: 'arasaac'; id: number }
  /** Look up an ARASAAC pictogram by keyword; show the emoji if none is found. */
  | { kind: 'arasaacSearch'; keywords: readonly string[]; emoji: string }
  /** A photo from the device, stored as a data URL. */
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
