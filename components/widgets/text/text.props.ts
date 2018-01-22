import { DEFAULT_PROP_DEF, PROP_TYPE, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-text',
        new Map(
            [
                ['autocomplete', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['autofocus', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['class', DEFAULT_PROP_DEF],
                ['datavalue', DEFAULT_PROP_DEF],
                ['disabled', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['maxchars', {type: PROP_TYPE.NUMBER}],
                ['maxvalue', {type: PROP_TYPE.NUMBER}],
                ['minvalue', {type: PROP_TYPE.NUMBER}],
                ['name', DEFAULT_PROP_DEF],
                ['placeholder', {value: 'Enter text'}],
                ['readonly', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['regexp', DEFAULT_PROP_DEF],
                ['required', {type: PROP_TYPE.BOOLEAN, value: false, notify: true}],
                ['shortcutkey', DEFAULT_PROP_DEF],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
                ['step', {type: PROP_TYPE.NUMBER}],
                ['tabindex', {type: PROP_TYPE.NUMBER}],
                ['type', DEFAULT_PROP_DEF]
            ]
        )
    );
};
