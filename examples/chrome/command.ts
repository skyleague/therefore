import { $dict, $object, $string } from '../../src'

export const command = $object({
    name: 'command',
    properties: {
        description: $string,

        suggested_key: $dict($string, {
            // patternProperties: {
            //     '^(default|mac|windows|linux|chromeos)$': {
            //         type: 'string'
            //         pattern: '^(Ctrl|Command|MacCtrl|Alt|Option)\\+(Shift\\+)?[A-Z]'
            //     }
            // }
        }),
    },
})
