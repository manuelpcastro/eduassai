import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { BeforeAfterPresentation } from './BeforeAfterPresentation'
import type { PlayableScenario } from './types'

const scenario: PlayableScenario = {
  id: 'x',
  title: 'Comer',
  before: { text: 'Lavarse las manos', picture: { kind: 'emoji', emoji: '🧼' } },
  after: { text: 'Comer', picture: { kind: 'emoji', emoji: '🍽️' } },
}

describe('BeforeAfterPresentation', () => {
  it('shows the situation already in order and reads the whole sentence', async () => {
    const speak = vi.fn()
    vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() })
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        lang = ''
        rate = 1
        text: string
        constructor(text: string) {
          this.text = text
        }
      },
    )
    const onNext = vi.fn()
    render(<BeforeAfterPresentation scenario={scenario} onNext={onNext} isLast={false} />)

    // Nothing to solve: no empty slots, and the cards are not buttons.
    expect(screen.queryByText('Toca una tarjeta')).toBeNull()
    expect(screen.queryByRole('button', { name: /^Lavarse las manos$/ })).toBeNull()
    expect(screen.getByText('Ahora toca lavarse las manos, después comer.')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /^Escuchar$/ }))
    expect(speak.mock.calls[0][0].text).toBe('Ahora toca lavarse las manos, después comer.')

    await userEvent.click(screen.getByRole('button', { name: /Escuchar: Después: Comer/ }))
    expect(speak.mock.calls[1][0].text).toBe('Después, comer.')

    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    expect(onNext).toHaveBeenCalled()
  })

  it('builds the sentence in English too', async () => {
    await i18n.changeLanguage('en')
    render(<BeforeAfterPresentation scenario={scenario} onNext={() => {}} isLast />)
    expect(screen.getByText("Now it's time to lavarse las manos, then comer.")).toBeInTheDocument()
  })
})
