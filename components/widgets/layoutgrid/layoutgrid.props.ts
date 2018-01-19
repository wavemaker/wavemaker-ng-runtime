import { DEFAULT_PROP_DEF, PROP_TYPE, register, DEFAULT_PROP_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-layoutgrid',
        new Map(
            [
                ['class', {value: ''}],
                ['height', DEFAULT_PROP_DEF],
                ['name', DEFAULT_PROP_DEF],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
                ['width', DEFAULT_PROP_DEF]
            ]
        )
    );
};
