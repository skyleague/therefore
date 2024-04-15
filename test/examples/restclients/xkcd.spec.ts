import { XKCD } from '../../../examples/restclients/xkcd/xkcd.client.js'
import type { Comic } from '../../../examples/restclients/xkcd/xkcd.type.js'
import { compileOutput } from '../../../src/commands/generate/generate.js'

import { describe, expect, it } from 'vitest'

it(' output generation', async () => {
    expect(
        await compileOutput(['examples/restclients/xkcd/xkcd.schema.ts'], {
            cwd: process.cwd(),
        }),
    ).toMatchSnapshot()
})

describe('xkcd', () => {
    const client = new XKCD()
    it('simple get', async () => {
        const result = await client.getInfo0JsonByComicId({ path: { comicId: '2653' } })
        const comic: Comic = result.body
        void comic
        expect(result).toMatchInlineSnapshot(
            {
                headers: expect.any(Object),
            },
            `
          {
            "body": {
              "alt": ""My parents were both omnitaurs, which is how I got interested in recombination," said the normal human.",
              "day": "1",
              "img": "https://imgs.xkcd.com/comics/omnitaur.png",
              "link": "",
              "month": "8",
              "news": "",
              "num": 2653,
              "safe_title": "Omnitaur",
              "title": "Omnitaur",
              "transcript": "",
              "year": "2022",
            },
            "headers": Any<Object>,
            "statusCode": 200,
          }
        `,
        )
    })
})
