import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_NUMBER_NOTIFY } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-page-content',
        new Map(
            [
                ['columnwidth', PROP_NUMBER_NOTIFY],
                ['content', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
            ]
        )
    );
};