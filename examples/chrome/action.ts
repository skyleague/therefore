import { uri, icon } from './icon'

import { $string, $object, $ref, $union } from '../../src'

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
        default_popup: $ref({
            description: 'The popup appears when the user clicks the icon.',
            reference: uri,
        }),
        default_icon: $union([
            $string({
                description: 'FIXME: String form is deprecated.',
            }),
            $object({
                description: 'Icon for the main toolbar.',
                properties: {
                    '19': $ref(icon),
                    '38': $ref(icon),
                },
            }),
        ]),
    },
    { name: 'action' }
)
