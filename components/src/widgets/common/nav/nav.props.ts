import { PROP_ANY, PROP_BOOLEAN, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-nav',
        new Map(
            [
                ['autoclose', Object.assign({value: 'always'}, PROP_STRING)],
                ['class', PROP_STRING],
                ['dataset', PROP_ANY],
                ['itemlabel', PROP_STRING],
                ['itemlink', PROP_STRING],
                ['itemicon', PROP_STRING],
                ['itemchildren', PROP_STRING],
                ['itemaction', PROP_STRING],
                ['itembadge', PROP_STRING],
                ['layout', PROP_STRING],
                ['name', PROP_STRING],
                ['orderby', PROP_STRING],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['type', PROP_STRING],
                ['userrole', PROP_STRING]
            ]
        )
    );
};