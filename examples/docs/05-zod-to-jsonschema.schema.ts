import { z } from 'zod'
import { $ref } from '../../src/lib/primitives/ref/ref.js'

// Define a Zod schema for a Product
export const Product = z.object({
    id: z.string().uuid(),
    name: z.string().min(3),
    price: z.number().positive(),
    category: z.enum(['Electronics', 'Books', 'Clothing']),
    inStock: z.boolean().default(true),
    tags: z.array(z.string()).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
})

// Convert the Zod schema to JSON Schema using Therefore
$ref(Product).validator({
    output: {
        // Generate JSON Schema file
        jsonschema: './schemas/product.schema.json',
    },
})
