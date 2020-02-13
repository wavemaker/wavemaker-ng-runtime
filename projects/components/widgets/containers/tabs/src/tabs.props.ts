import { isMobileApp } from '@wm/core';

import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    const props = new Map(
        [
            ['class', PROP_STRING],
            ['defaultpaneindex', {value: 0, ...PROP_NUMBER}],
            ['justified', PROP_BOOLEAN],
            ['tabsposition', {value: 'top', ...PROP_STRING}],
            ['name', PROP_STRING],
            ['show', {value: true, ...PROP_BOOLEAN}],
            ['transition', PROP_STRING]
        ]
    );
    if (isMobileApp()) {
        props.set('transition', {value: 'slide', ...PROP_STRING});
    }
    register('wm-tabs', props);
};
