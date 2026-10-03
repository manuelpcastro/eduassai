import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import i18n from '../../i18n'
import { BeforeAfterGame } from './BeforeAfterGame'
import { SCENARIOS } from './scenarios'

const scenario = SCENARIOS[0] // socks -> shoes

describe('BeforeAfterGame', () => {
  it('praises the correct order and moves on', async () => {
    const onNext = vi.fn()
    render(<BeforeAfterGame scenario={scenario} onNext={onNext} isLast={false} />)

    await userEvent.click(screen.getByRole('button', { name: /Ponerse los calcetines/ }))
    await userEvent.click(screen.getByRole('button', { name: /Ponerse los zapatos/ }))

    expect(screen.getByText('¡Muy bien!')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Siguiente/ }))
    expect(onNext).toHaveBeenCalled()
  })

  it('offers a gentle retry for the wrong order', async () => {
    render(<BeforeAfterGame scenario={scenario} onNext={() => {}} isLast={false} />)

    await userEvent.click(screen.getByRole('button', { name: /Ponerse los zapatos/ }))
    await userEvent.click(screen.getByRole('button', { name: /Ponerse los calcetines/ }))

    expect(screen.getByText('Casi. Vamos a probar otra vez.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Otra vez/ }))
    expect(screen.getAllByText('Toca una tarjeta')).toHaveLength(2)
  })

  it('lets a placed card be taken back', async () => {
    render(<BeforeAfterGame scenario={scenario} onNext={() => {}} isLast={false} />)

    await userEvent.click(screen.getByRole('button', { name: /Ponerse los zapatos/ }))
    await userEvent.click(screen.getByRole('button', { name: /Antes: Ponerse los zapatos/ }))
    expect(screen.getAllByText('Toca una tarjeta')).toHaveLength(2)
  })

  it('switches language', async () => {
    await i18n.changeLanguage('en')
    render(<BeforeAfterGame scenario={scenario} onNext={() => {}} isLast={false} />)
    expect(screen.getByRole('button', { name: /Put on socks/ })).toBeInTheDocument()
    expect(screen.getByText('Before')).toBeInTheDocument()
  })
})
