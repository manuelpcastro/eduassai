import { useEffect, useState } from 'react'
import { findPictogram, pictogramUrl } from '../../lib/arasaac'
import type { Picture } from './types'

interface Props {
  picture: Picture
  className?: string
}

/** Shows a card picture. Decorative: the card's text says what it is. */
export function PictureView({ picture, className = '' }: Props) {
  switch (picture.kind) {
    case 'emoji':
      return <Emoji emoji={picture.emoji} className={className} />
    case 'arasaac':
      return <img className={`picture ${className}`} src={pictogramUrl(picture.id)} alt="" />
    case 'photo':
      return <img className={`picture picture-photo ${className}`} src={picture.src} alt="" />
    case 'arasaacSearch':
      return <SearchedPictogram keywords={picture.keywords} emoji={picture.emoji} className={className} />
  }
}

function Emoji({ emoji, className }: { emoji: string; className: string }) {
  return (
    <span className={`picture picture-emoji ${className}`} aria-hidden="true">
      {emoji}
    </span>
  )
}

function SearchedPictogram({
  keywords,
  emoji,
  className,
}: {
  keywords: readonly string[]
  emoji: string
  className: string
}) {
  const key = keywords.join('|')
  // undefined = still looking, null = not found / offline.
  const [found, setFound] = useState<{ key: string; id: number | null }>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    void findPictogram(key.split('|')).then((id) => {
      if (active) setFound({ key, id })
    })
    return () => {
      active = false
    }
  }, [key])

  const id = found?.key === key ? found.id : undefined
  // Keep the space empty while loading so nothing jumps between pictures.
  if (id === undefined) return <span className={`picture ${className}`} aria-hidden="true" />
  if (id === null || failed) return <Emoji emoji={emoji} className={className} />
  return <img className={`picture ${className}`} src={pictogramUrl(id)} alt="" onError={() => setFailed(true)} />
}
