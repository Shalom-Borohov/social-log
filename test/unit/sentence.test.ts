import { describe, expect, it } from 'vitest'
import { dateWord, durationLabel, peopleLabel } from '../../src/domain/sentence'
import { aGroup, aPerson } from '../helpers/meetups'

const people = [
  aPerson({ id: 'tamar', name: 'תמר' }),
  aPerson({ id: 'maya', name: 'מאיה' }),
  aPerson({ id: 'noam', name: 'נועם' }),
  aPerson({ id: 'omer', name: 'עומר' }),
]

describe('peopleLabel', () => {
  it('joins two names with ו', () => {
    expect(peopleLabel(['tamar', 'maya'], people, [])).toBe('תמר ומאיה')
  })

  it('lists three names in full', () => {
    expect(peopleLabel(['tamar', 'maya', 'noam'], people, [])).toBe('תמר, מאיה ונועם')
  })

  it('shortens four or more to two names and a count', () => {
    expect(peopleLabel(['tamar', 'maya', 'noam', 'omer'], people, [])).toBe('תמר, מאיה ועוד 2')
  })

  it('uses the group name when every member came', () => {
    const army = aGroup({ id: 'army', name: 'החבר׳ה מהצבא', memberIds: ['noam', 'omer'] })

    expect(peopleLabel(['omer', 'noam'], people, [army], 'army')).toBe('החבר׳ה מהצבא')
    expect(peopleLabel(['omer'], people, [army], 'army')).toBe('עומר')
  })
})

describe('dateWord', () => {
  it('says היום, אתמול and שלשום for the last three days', () => {
    expect(dateWord('2026-11-08', '2026-11-08')).toBe('היום')
    expect(dateWord('2026-11-07', '2026-11-08')).toBe('אתמול')
    expect(dateWord('2026-11-06', '2026-11-08')).toBe('שלשום')
  })

  it('names the weekday and date for older days', () => {
    expect(dateWord('2026-11-05', '2026-11-08')).toBe('ביום חמישי 5.11')
  })
})

describe('durationLabel', () => {
  it.each([
    [30, 'חצי שעה'],
    [45, '45 דקות'],
    [60, 'שעה'],
    [90, 'שעה וחצי'],
    [120, 'שעתיים'],
    [150, 'שעתיים וחצי'],
    [180, '3 שעות'],
    [210, '3 שעות וחצי'],
    [80, 'שעה ו־20 דקות'],
  ])('%i minutes reads %s', (minutes, label) => {
    expect(durationLabel(minutes)).toBe(label)
  })
})
