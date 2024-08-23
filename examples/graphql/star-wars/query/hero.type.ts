/**
 * Generated by @skyleague/therefore@v1.0.0-local
 * Do not manually touch this
 */
/* eslint-disable */

import type { Character } from '../types/character.type.js'
import type { Droid } from '../types/droid.type.js'
import type { Human } from '../types/human.type.js'
import type { CharacterArgs, HeroArgs } from '../types/input.type.js'

export type DroidFieldArgs = CharacterArgs

export type DroidFieldType = Droid

export type DroidField = (args: DroidFieldArgs) => DroidFieldType

export type HeroFieldArgs = HeroArgs

export type HeroFieldType = Character

export type HeroField = (input: HeroFieldArgs) => HeroFieldType

export type HumanFieldArgs = CharacterArgs

export type HumanFieldType = Human

export type HumanField = (args: HumanFieldArgs) => HumanFieldType