import { register, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-nav',
        new Map(
            [
                ['autoclose', Object.assign({value: 'always'}, PROP_STRING)],
                ['class', PROP_STRING],
                ['dataset', PROP_STRING_NOTIFY],
                ['itemlabel', PROP_STRING_NOTIFY],
                ['itemlink', PROP_STRING_NOTIFY],
                ['itemicon', PROP_STRING_NOTIFY],
                ['itemchildren', PROP_STRING_NOTIFY],
                ['itemaction', PROP_STRING_NOTIFY],
                ['itembadge', PROP_STRING_NOTIFY],
                ['layout', PROP_STRING_NOTIFY],
                ['name', PROP_STRING],
                ['orderby', PROP_STRING],
                ['show', PROP_BOOLEAN],
                ['type', PROP_STRING_NOTIFY],
                ['userrole', PROP_STRING_NOTIFY]
            ]
        )
    );
};