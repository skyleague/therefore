/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

type EventTypesArray = 'start' | 'word' | 'sentence' | 'marker' | 'end' | 'error'

export interface ContentScripts {
    /**
     * Specifies which pages this content script will be injected into.
     */
    matches: [MatchPattern, ...MatchPattern[]]
}

export type EventTypes = [EventTypesArray, ...EventTypesArray[]] | undefined

export type MatchPattern = string
