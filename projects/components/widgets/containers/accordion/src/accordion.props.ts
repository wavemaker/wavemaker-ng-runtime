import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-accordion',
        new Map(
            [
                ['class', PROP_STRING],
                ['closeothers', {value: true, ...PROP_BOOLEAN}],
                ['dataset', PROP_ANY],
                ['defaultpaneindex', {value: 0, ...PROP_NUMBER}],
                ['name', PROP_STRING],
                ['nodatamessage', {value: 'No Data Found', ... PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['statehandler', {value: 'none', ...PROP_STRING}],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['type', PROP_STRING]
            ]
        )
    );
};
