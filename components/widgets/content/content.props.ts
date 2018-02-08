import { register, PROP_STRING, PROP_NUMBER_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-content',
        new Map(
            [
                ['name', PROP_STRING],
                ['columnwidth', PROP_NUMBER_NOTIFY]
            ]
        )
    );
};