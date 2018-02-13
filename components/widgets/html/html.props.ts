import { PROP_STRING, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-html',
        new Map(
            [
                ['content', PROP_STRING]
            ]
        )
    );
};
