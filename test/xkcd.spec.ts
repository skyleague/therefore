import { Xkcd } from '../examples/xkcd/xkcd.client'

describe('xkcd', () => {
    const client = new Xkcd()
    test('simple get', async () => {
        expect(await client.getInfo0JsonByComicId({ path: { comicId: '2653' } })).toMatchInlineSnapshot(`
            Object {
              "alt": "\\"My parents were both omnitaurs, which is how I got interested in recombination,\\" said the normal human.",
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
            }
        `)
    })
})
