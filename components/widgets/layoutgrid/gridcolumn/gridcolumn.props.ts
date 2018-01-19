import { DEFAULT_PROP_DEF, PROP_TYPE, register, DEFAULT_PROP_NOTIFY } from '../../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-gridcolumn',
        new Map(
            [
                ['class', {value: ''}],
                ['height', DEFAULT_PROP_DEF],
                ['name', DEFAULT_PROP_DEF],
                ['columnwidth', DEFAULT_PROP_NOTIFY],
                ['padding', DEFAULT_PROP_DEF],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
            ]
        )
    );
};
