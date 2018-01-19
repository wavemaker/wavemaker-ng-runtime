import { DEFAULT_PROP_DEF, PROP_TYPE, register, DEFAULT_PROP_NOTIFY } from '../../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-gridrow',
        new Map(
            [
                ['class', {value: ''}],
                ['height', DEFAULT_PROP_DEF],
                ['name', DEFAULT_PROP_DEF],
                ['overflow', DEFAULT_PROP_DEF],
                ['padding', DEFAULT_PROP_DEF],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
            ]
        )
    );
};
