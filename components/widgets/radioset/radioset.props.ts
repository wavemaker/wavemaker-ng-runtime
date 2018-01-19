import { DEFAULT_PROP_DEF, PROP_TYPE, register, DEFAULT_PROP_NOTIFY } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-radioset',
        new Map(
            [
                ['class', {value: ''}],
                ['datafield', DEFAULT_PROP_NOTIFY],
                ['dataset', DEFAULT_PROP_NOTIFY],
                ['datavalue', DEFAULT_PROP_NOTIFY],
                ['disabled', {type: PROP_TYPE.BOOLEAN, value: false}],
                ['displayexpression', DEFAULT_PROP_NOTIFY],
                ['displayfield', DEFAULT_PROP_NOTIFY],
                ['height', DEFAULT_PROP_DEF],
                ['itemclass', {value: ''}],
                ['layout', {value: 'stacked'}],
                ['margin', DEFAULT_PROP_DEF],
                ['name', DEFAULT_PROP_DEF],
                ['orderby', DEFAULT_PROP_NOTIFY],
                ['readonly', {type: PROP_TYPE.BOOLEAN, value: false}],
                ['required', {type: PROP_TYPE.BOOLEAN, value: false}],
                ['selectedvalue', DEFAULT_PROP_NOTIFY],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
                ['showindevice', {displayType: 'inline-block', value: 'all'}],
                ['usekeys', {type: PROP_TYPE.BOOLEAN, notify: true, value: false}],
                ['width', DEFAULT_PROP_DEF],
                ['tabindex', DEFAULT_PROP_DEF],
                ['type', DEFAULT_PROP_DEF]
            ]
        )
    );
};
