import { DEFAULT_PROP_DEF, PROP_TYPE, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-textarea',
        new Map(
            [
                ['autofocus', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['class', DEFAULT_PROP_DEF],
                ['datavalue', DEFAULT_PROP_DEF],
                ['disabled', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['maxchars', {type: PROP_TYPE.NUMBER}],
                ['name', DEFAULT_PROP_DEF],
                ['placeholder', {value: 'Place your text'}],
                ['readonly', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['required', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['shortcutkey', DEFAULT_PROP_DEF],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
                ['tabindex', {type: PROP_TYPE.NUMBER}]
            ]
        )
    );
};
