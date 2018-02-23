import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '../../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-accordionpane',
        new Map(
            [
                ['badgetype', PROP_STRING],
                ['badgevalue', PROP_STRING],
                ['iconclass', PROP_STRING],
                ['isdefaultpane', PROP_BOOLEAN],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', {value: 'Title', ...PROP_STRING}]
            ]
        )
    );
};
