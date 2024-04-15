/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

export type HomePlanetResolverType = string | undefined

/**
 * The home planet of the human, or null if unknown.
 */
export type HomePlanetResolver = () => HomePlanetResolverType

/**
 * A humanoid creature in the Star Wars universe.
 */
export interface Human {
    /**
     * The id of the character
     */
    id: string
    /**
     * The name of the character
     */
    name: string
}
