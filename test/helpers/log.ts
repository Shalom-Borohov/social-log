import { fireEvent, screen } from '@testing-library/react'

export const slot = (role: string) =>
  screen.findByRole('button', { name: (name) => name.startsWith(`${role}:`) })

export const findButton = (name: string) => screen.findByRole('button', { name })

export const pressed = async (name: string) => (await findButton(name)).getAttribute('aria-pressed')

export async function tap(name: string) {
  fireEvent.click(await findButton(name))
}

export async function tapSlot(role: string) {
  fireEvent.click(await slot(role))
}

export async function typeInto(label: string, value: string) {
  fireEvent.change(await screen.findByLabelText(label), { target: { value } })
}

interface RequiredSlots {
  people: string[]
  place: string
  duration: string
  rating: string
}

export async function fillRequiredSlots({ people, place, duration, rating }: RequiredSlots) {
  for (const person of people) {
    await tap(person)
  }

  await tap('המשך')
  await typeInto('מקום', place)
  await tap('המשך')
  await tap(duration)
  await tap(rating)
}
