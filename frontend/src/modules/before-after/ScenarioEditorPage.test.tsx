import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { CustomBeforeAfterPage } from './BeforeAfterPage'
import { ScenarioEditorPage } from './ScenarioEditorPage'

function mockArasaac() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const word = decodeURIComponent(url.split('/').pop()!)
      const id = word === 'pijama' ? 101 : 202
      return new Response(JSON.stringify([{ _id: id, keywords: [{ keyword: word }] }]))
    }),
  )
}

function renderEditor() {
  render(
    <MemoryRouter initialEntries={['/antes-despues/crear']}>
      <Routes>
        <Route path="/antes-despues/crear" element={<ScenarioEditorPage />} />
        <Route path="/antes-despues/mis/:customId" element={<CustomBeforeAfterPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function pickPictogram(region: HTMLElement, word: string) {
  await userEvent.type(within(region).getByRole('searchbox'), word)
  await userEvent.click(within(region).getByRole('button', { name: /Buscar/ }))
  await userEvent.click(await within(region).findByRole('button', { name: word }))
}

describe('ScenarioEditorPage', () => {
  it('creates a situation from ARASAAC pictograms and opens it', async () => {
    mockArasaac()
    renderEditor()
    const save = screen.getByRole('button', { name: 'Guardar y practicar' })
    expect(save).toBeDisabled()

    await userEvent.type(screen.getByLabelText(/Nombre de la situación/), 'A dormir')
    await pickPictogram(screen.getByRole('region', { name: 'Antes' }), 'pijama')
    await pickPictogram(screen.getByRole('region', { name: 'Después' }), 'dormir')

    // The keyword fills in the card text when it was empty.
    expect(within(screen.getByRole('region', { name: 'Antes' })).getByDisplayValue('Pijama')).toBeInTheDocument()

    await userEvent.click(save)

    const [saved] = JSON.parse(localStorage.getItem('eduassai.beforeAfter.custom')!)
    expect(saved).toMatchObject({
      title: 'A dormir',
      before: { text: 'Pijama', picture: { kind: 'arasaac', id: 101 } },
      after: { text: 'Dormir', picture: { kind: 'arasaac', id: 202 } },
    })
    expect(await screen.findByRole('heading', { name: 'A dormir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Pijama/ })).toBeInTheDocument()
  })

  it('explains when ARASAAC cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('offline'))))
    renderEditor()
    const before = screen.getByRole('region', { name: 'Antes' })
    await userEvent.type(within(before).getByRole('searchbox'), 'zapatos')
    await userEvent.click(within(before).getByRole('button', { name: /Buscar/ }))
    expect(await within(before).findByText(/No se pudo conectar con ARASAAC/)).toBeInTheDocument()
  })
})
