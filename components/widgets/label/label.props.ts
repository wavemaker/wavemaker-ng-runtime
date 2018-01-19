import { DEFAULT_PROP_DEF, PROP_TYPE, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-label',
        new Map(
            [
                ['animation', DEFAULT_PROP_DEF],
                ['caption', {notify: true, value: 'Label'}],
                ['class', DEFAULT_PROP_DEF],
                ['conditionalclass', DEFAULT_PROP_DEF],
                ['hint', DEFAULT_PROP_DEF],
                ['name', DEFAULT_PROP_DEF],
                ['required', {type: PROP_TYPE.BOOLEAN}],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
                ['showindevice', {displayType: 'inline-block', value: 'all'}],
            ]
        )
    );
};
