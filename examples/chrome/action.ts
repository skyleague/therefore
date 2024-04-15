import { icon, uri } from './icon.js'

import { $object, $ref, $string, $union } from '../../src/index.js'

// const action = {
//     type: 'object',
//     properties: {},
//     dependencies: {
//         name: { not: { required: ['name'] } },
//         icons: { not: { required: ['icons'] } },
//         popup: { not: { required: ['popup'] } },
//     },
// }

export const action = $object(
    {
        default_title: $string({
            description: 'Tooltip for the main toolbar icon.',
        }),
        default_popup: $ref(uri, {
            description: 'The popup appears when the user clicks the icon.',
        }),
        default_icon: $union([
            $string({
                description: 'FIXME: String form is deprecated.',
            }),
            $object({
                '19': $ref(icon),
                '38': $ref(icon),
            }).describe('Icon for the main toolbar.'),
        ]),
    },
    { name: 'action' },
)
