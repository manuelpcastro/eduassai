import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { BeforeAfterGame } from './BeforeAfterGame'
import { SCENARIOS, toPlayable } from './scenarios'

// wake up -> have breakfast, translated with the current language
const playable = () => toPlayable(SCENARIOS[0], i18n.t)

describe('BeforeAfterGame', () => {
  it('praises the correct order and moves on', async () => {
    const onNext = vi.fn()
    render(<BeforeAfterGame scenario={playable()} onNext={onNext} isLast={false} />)

    await userEvent.click(screen.getByRole('button', { name: /Despertarse/ }))
    await userEvent.click(screen.getByRole('button', { name: /Desayunar/ }))

    expect(screen.getByText('¡Muy bien!')).toBeInTheDocument()
    expect(screen.getByText('Ahora toca despertarse, después desayunar.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    expect(onNext).toHaveBeenCalled()
  })

  it('offers a gentle retry for the wrong order', async () => {
    render(<BeforeAfterGame scenario={playable()} onNext={() => {}} isLast={false} />)

    await userEvent.click(screen.getByRole('button', { name: /Desayunar/ }))
    await userEvent.click(screen.getByRole('button', { name: /Despertarse/ }))

    expect(screen.getByText('Casi. Vamos a probar otra vez.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Otra vez/ }))
    expect(screen.getAllByText('Toca una tarjeta')).toHaveLength(2)
  })

  it('lets a placed card be taken back', async () => {
    render(<BeforeAfterGame scenario={playable()} onNext={() => {}} isLast={false} />)

    await userEvent.click(screen.getByRole('button', { name: /Desayunar/ }))
    await userEvent.click(screen.getByRole('button', { name: /Ahora: Desayunar/ }))
    expect(screen.getAllByText('Toca una tarjeta')).toHaveLength(2)
  })

  it('switches language', async () => {
    await i18n.changeLanguage('en')
    render(<BeforeAfterGame scenario={playable()} onNext={() => {}} isLast={false} />)
    expect(screen.getByRole('button', { name: /Wake up/ })).toBeInTheDocument()
    expect(screen.getByText('Now')).toBeInTheDocument()
  })
})
