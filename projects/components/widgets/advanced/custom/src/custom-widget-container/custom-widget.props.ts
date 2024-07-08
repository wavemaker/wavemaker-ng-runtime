import { PROP_BOOLEAN, PROP_STRING } from '@wm/components/base';

export const customWidgetProps =
    new Map(
        [
            ['class', PROP_STRING],
            ['hint', PROP_STRING],
            ['name', PROP_STRING],
            ['widgetname', PROP_STRING],
            ['show', { value: true, ...PROP_BOOLEAN }]
        ]
    )
