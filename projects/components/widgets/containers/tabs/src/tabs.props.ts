import { isMobileApp } from '@wm/core';

import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    const props = new Map(
        [
            ['class', PROP_STRING],
            ['dataset', PROP_ANY],
            ['defaultpaneindex', {value: 0, ...PROP_NUMBER}],
            ['justified', PROP_BOOLEAN],
            ['tabsposition', {value: 'top', ...PROP_STRING}],
            ['name', PROP_STRING],
            ['nodatamessage', {value: 'No Data Found', ... PROP_STRING}],
            ['show', {value: true, ...PROP_BOOLEAN}],
            ['statehandler', {value: 'none', ...PROP_STRING}],
            ['transition', PROP_STRING],
            ['type', PROP_STRING]
        ]
    );
    if (isMobileApp()) {
        props.set('transition', {value: 'slide', ...PROP_STRING});
    }
    register('wm-tabs', props);
};
