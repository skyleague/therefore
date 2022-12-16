---
sidebar_position: 40
---

# Restclient

OpenAPI (formerly known as Swagger) is a popular specification for describing RESTful APIs. It allows developers to define the structure and content of an API in a standardized way, making it easier to understand and consume the API. This can be particularly useful when working on large and complex projects, where multiple teams and stakeholders need to collaborate on the design and implementation of an API.

One of the key benefits of using OpenAPI is that it enables developers to generate code artifacts from the OpenAPI definitions. This can save a significant amount of time and effort, as it eliminates the need to manually write code for common tasks such as serializing and deserializing data, or creating and sending HTTP requests. Instead, developers can use the generated code artifacts to quickly and easily interact with the API, without having to worry about the underlying details.

One common code artifact that can be generated from OpenAPI definitions is a REST client. A REST client is a library or framework that simplifies the process of making HTTP requests to a RESTful API. It typically provides a high-level, abstracted interface for sending requests and receiving responses, hiding the complexity of the underlying HTTP protocol and allowing developers to focus on the business logic of their application.

Generating a REST client from OpenAPI definitions can provide a number of benefits in development. For example:

-   It ensures that the REST client is consistent with the API definition, so you don't have to worry about discrepancies between the two.
-   It reduces the amount of code that you need to write, as the REST client is generated automatically from the OpenAPI definitions.
-   It provides a simple and intuitive interface for interacting with the API, making it easier to focus on the business logic of your application.
-   It enables you to quickly and easily test the API, as the REST client provides a convenient way to send requests and receive responses.
-   It supports code reuse, as the generated REST client can be shared and used by multiple teams and stakeholders, ensuring consistent and reliable access to the API.

Luckily, generating a REST client from your specification with Therefore is easy:

```ts title="./xkcd.schema.ts"
export const XKCD = got
    .get('https://raw.githubusercontent.com/APIs-guru/openapi-directory/main/APIs/xkcd.com/1.0.0/openapi.yaml')
    .text()
    .then((data) => $restclient(yaml.load(data) as OpenapiV3, { useEither: false }))
```

```ts title="./xkcd.type.ts"
export interface Comic {
    alt?: string
    day?: string
    img?: string
    link?: string
    month?: string
    news?: string
    num?: number
    safe_title?: string
    title?: string
    transcript?: string
    year?: string
}

export const Comic = {
    validate: require('./schemas/comic.schema.js') as ValidateFunction<Comic>,
    get schema() {
        return Comic.validate.schema
    },
    get errors() {
        return Comic.validate.errors ?? undefined
    },
    is: (o: unknown): o is Comic => Comic.validate(o) === true,
    assert: (o: unknown) => {
        if (!Comic.validate(o)) {
            throw new AjvValidator.ValidationError(Comic.errors ?? [])
        }
    },
} as const
```

```ts title="./xkcd.client.ts"
/**
 * XKCD
 *
 * Webcomic of romance, sarcasm, math, and language.
 */
export class XKCD {
    public client: Got

    public constructor({
        prefixUrl = 'http://xkcd.com/',
        options,
    }: {
        prefixUrl?: string | 'http://xkcd.com/'
        options?: Options
    } = {}) {
        this.client = got.extend(...[{ prefixUrl }, options].filter((o): o is Options => o !== undefined))
    }

    /**
     * Fetch current comic and metadata.
     */
    public async getInfo0Json() {
        return this.awaitResponse(
            this.client.get(`info.0.json`, {
                responseType: 'json',
            }),
            {
                200: Comic,
            }
        )
    }

    /**
     * Fetch comics and metadata  by comic id.
     */
    public async getInfo0JsonByComicId({ path }: { path: { comicId: string } }) {
        return this.awaitResponse(
            this.client.get(`${path.comicId}/info.0.json`, {
                responseType: 'json',
            }),
            {
                200: Comic,
            }
        )
    }

    <snip>
}
```
