import { describe, expect, it } from 'vitest'
import { splitParts } from '../../src/domain/split'

describe('splitParts', () => {
  it('splits on commas and on ו at the start of a later word', () => {
    expect(splitParts('דני, רוני ומיכל')).toEqual(['דני', 'רוני', 'מיכל'])
  })

  it('splits two places joined by ו', () => {
    expect(splitParts('בטיילת ובים')).toEqual(['בטיילת', 'בים'])
  })

  it('keeps a name that itself starts with ו after the joining ו', () => {
    expect(splitParts('דני וורד')).toEqual(['דני', 'ורד'])
  })

  it('splits a ו written as its own word', () => {
    expect(splitParts('דני ו רוני')).toEqual(['דני', 'רוני'])
  })

  it('trims the parts and drops empty ones', () => {
    expect(splitParts(' קפה ,, שש-בש , ')).toEqual(['קפה', 'שש-בש'])
  })

  it('leaves a single item whole', () => {
    expect(splitParts('ורד')).toEqual(['ורד'])
    expect(splitParts('הופעה/סרט')).toEqual(['הופעה/סרט'])
    expect(splitParts('אצל נועם')).toEqual(['אצל נועם'])
  })
})
