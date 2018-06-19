import { PROP_BOOLEAN, register } from '../../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-carousel-template',
        new Map(
            [
                ['show', PROP_BOOLEAN]
            ]
        )
    );
};
