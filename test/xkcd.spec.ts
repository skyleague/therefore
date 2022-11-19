import { XKCD } from '../examples/xkcd/xkcd.client'
import type { Comic } from '../examples/xkcd/xkcd.type'

describe('xkcd', () => {
    const client = new XKCD()
    test('simple get', async () => {
        const result = await client.getInfo0JsonByComicId({ path: { comicId: '2653' } })
        const comic: Comic = result.body
        void comic
        expect(result).toMatchInlineSnapshot(
            {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
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
        `
        )
    })
})
