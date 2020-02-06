import { FormWidgetType } from '@wm/core';

import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, getWidgetPropsByType } from '@wm/components/base';

export const registerProps = () => {
    const formFieldMap = new Map(
        [
            ['content', PROP_STRING],
            ['dataentrymode', {value: 'default', ...PROP_STRING}],
            ['debouncetime', {value: 250, ...PROP_NUMBER}],
            ['defaultvalue', PROP_STRING],
            ['displayname', PROP_STRING],
            ['display-name', PROP_STRING],
            ['field', PROP_STRING],
            ['filterexpressions', PROP_STRING],
            ['filter-on', PROP_STRING],
            ['generator', PROP_STRING],
            ['hint', PROP_STRING],
            ['inputtype', PROP_STRING],
            ['is-primary-key', PROP_BOOLEAN],
            ['is-range', PROP_BOOLEAN],
            ['is-related', PROP_BOOLEAN],
            ['isformfield', {value: true}],
            ['key', PROP_STRING],
            ['limit', PROP_NUMBER],
            ['lookup-type', PROP_STRING],
            ['lookup-field', PROP_STRING],
            ['name', PROP_STRING],
            ['matchmode', PROP_STRING],
            ['maxdefaultvalue', PROP_STRING],
            ['maxplaceholder', PROP_STRING],
            ['mobile-display', {value: true, ...PROP_BOOLEAN}],
            ['period', PROP_BOOLEAN],
            ['pc-display', {value: true, ...PROP_BOOLEAN}],
            ['placeholder', PROP_STRING],
            ['primary-key', PROP_BOOLEAN],
            ['related-entity-name', PROP_STRING],
            ['required', PROP_BOOLEAN],
            ['show', {value: true, ...PROP_BOOLEAN}],
            ['type', PROP_STRING],
            ['validationmessage', PROP_STRING],
            ['viewmodewidget', PROP_STRING],
            ['widgettype', PROP_STRING]
        ]
    );

    for (const key in FormWidgetType) {
        const widgetName = 'wm-form-field-' + FormWidgetType[key];
        const widgetProps = getWidgetPropsByType(widgetName);
        formFieldMap.forEach((v, k: string) => {
            if (widgetProps.get(k) == undefined) {
                widgetProps.set(k, v);
            }
        });
    }
};
