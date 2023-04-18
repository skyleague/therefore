# Chrome extension format example

This is a very straightforward example of the [Chrome extension format](https://json.schemastore.org/chrome-manifest).

The examples consists of a few files:

-   `icon.ts`; non exported but shareable icon definition
-   `action.ts`; non exported but shareable action definition
-   `command.ts`; non exported but shareable command definition
-   `extension.schema.ts`; the exported chrome extension definition

What is interesting to note in this example is that **only** the `extension.type.ts` exported constants get picked up by Therefore, and will result in a `.type.ts` file with accompanying schemas. This provides us with a neat trick of adding reusable schema definitions, without the extra overhead of generating schemas for those objects.

We can now generate the output:

```console
 $ therefore -d examples/chrome/
scanning examples/chrome/extension.schema.ts
 - found Extension
 $ node_modules/.bin/prettier --write examples/chrome/extension.type.ts examples/chrome/schemas/extension.schema.json
examples/chrome/extension.type.ts 200ms
examples/chrome/schemas/extension.schema.json 123ms
Done in 0.79s.
```
