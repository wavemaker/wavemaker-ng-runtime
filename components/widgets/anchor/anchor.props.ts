import { DEFAULT_PROP_DEF, PROP_TYPE, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-anchor',
        new Map(
            [
                ['animation', DEFAULT_PROP_DEF],
                ['badgevalue', {notify: true}],
                ['caption', {notify: true}],
                ['class', {value: 'btn-default'}],
                ['conditionalclass', DEFAULT_PROP_DEF],
                ['encodeurl', {type: PROP_TYPE.BOOLEAN}],
                ['hint', DEFAULT_PROP_DEF],
                ['hyperlink', DEFAULT_PROP_DEF],
                ['iconclass', {notify: true}],
                ['iconheight', {notify: true}],
                ['iconmargin', {notify: true}],
                ['iconposition', {notify: true}],
                ['iconurl', DEFAULT_PROP_DEF],
                ['iconwidth', {notify: true}],
                ['name', DEFAULT_PROP_DEF],
                ['shortcutkey', DEFAULT_PROP_DEF],
                ['show', {type: PROP_TYPE.BOOLEAN, value: true}],
                ['showindevice', {displayType: 'inline-block', value: 'all'}],
                ['tabindex', DEFAULT_PROP_DEF],
                ['target', DEFAULT_PROP_DEF]
            ]
        )
    );
};
