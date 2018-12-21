import { isMobileApp } from '@wm/core';

import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-page-content',
        new Map(
            [
                ['class', PROP_STRING],
                ['columnwidth', PROP_NUMBER],
                ['content', PROP_STRING],
                ['name', PROP_STRING],
                ['pulltorefresh', {value: isMobileApp(), ...PROP_BOOLEAN}]
            ]
        )
    );
};
