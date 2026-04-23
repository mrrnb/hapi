import { describe, expect, it } from 'vitest'
import { getModelOptionsForFlavor, getNextModelForFlavor } from './modelOptions'

describe('getModelOptionsForFlavor', () => {
    it('returns Gemini model options for gemini flavor', () => {
        const options = getModelOptionsForFlavor('gemini')
        expect(options[0]).toEqual({ value: null, label: 'Default' })
        expect(options.some((o) => o.value === 'gemini-3-flash-preview')).toBe(true)
        expect(options.some((o) => o.value === 'gemini-2.5-flash')).toBe(true)
    })

    it('returns Claude model options for claude flavor', () => {
        const options = getModelOptionsForFlavor('claude')
        expect(options[0]).toEqual({ value: null, label: 'Auto' })
        expect(options.some((o) => o.value === 'sonnet')).toBe(true)
        expect(options.some((o) => o.value === 'opus')).toBe(true)
    })

    it('returns Codex model options for codex flavor', () => {
        const options = getModelOptionsForFlavor('codex')
        expect(options[0]).toEqual({ value: null, label: 'Auto' })
        expect(options[1]).toEqual({ value: 'gpt-5.5', label: 'GPT-5.5' })
        expect(options.some((o) => o.value === 'gpt-5.4-mini')).toBe(true)
    })

    it('includes custom Gemini model from env/config in options', () => {
        const options = getModelOptionsForFlavor('gemini', 'gemini-custom-experiment')
        expect(options.some((o) => o.value === 'gemini-custom-experiment')).toBe(true)
    })

    it('includes custom Codex model from an active session in options', () => {
        const options = getModelOptionsForFlavor('codex', 'gpt-next-experiment')
        expect(options).toContainEqual({ value: 'gpt-next-experiment', label: 'gpt-next-experiment' })
    })

    it('does not duplicate a preset Gemini model', () => {
        const options = getModelOptionsForFlavor('gemini', 'gemini-2.5-flash')
        const flashCount = options.filter((o) => o.value === 'gemini-2.5-flash').length
        expect(flashCount).toBe(1)
    })

    it('does not duplicate a preset Codex model', () => {
        const options = getModelOptionsForFlavor('codex', 'gpt-5.5')
        const count = options.filter((o) => o.value === 'gpt-5.5').length
        expect(count).toBe(1)
    })
})

describe('getNextModelForFlavor', () => {
    it('cycles Gemini models', () => {
        const next = getNextModelForFlavor('gemini', null)
        expect(next).not.toBeNull()
    })

    it('cycles Claude models', () => {
        const next = getNextModelForFlavor('claude', null)
        expect(next).not.toBeNull()
    })

    it('cycles Codex models', () => {
        expect(getNextModelForFlavor('codex', null)).toBe('gpt-5.5')
    })
})
