import { $object, $record, $string } from '../../src/index.js'

export const command = $object(
    {
        description: $string,

        suggested_key: $record($string, {
            // patternProperties: {
            //     '^(default|mac|windows|linux|chromeos)$': {
            //         type: 'string'
            //         pattern: '^(Ctrl|Command|MacCtrl|Alt|Option)\\+(Shift\\+)?[A-Z]'
            //     }
            // }
        }),
    },
    {
        name: 'command',
    },
)
