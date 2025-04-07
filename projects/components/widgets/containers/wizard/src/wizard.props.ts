import {PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register} from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-wizard',
        new Map(
            [
                ['actionsalignment', {value: 'right', ...PROP_STRING}],
                ['cancelable', {value: true, ...PROP_BOOLEAN}],
                ['cancelbtnlabel', {value: 'Cancel', ...PROP_STRING}],
                ['class', {value: 'classic', ...PROP_STRING}],
                ['dataset', PROP_ANY],
                ['defaultstep', {value: 'none', ...PROP_STRING}],
                ['defaultstepindex', {value: 0, ...PROP_NUMBER}],
                ['donebtnlabel', {value: 'Done', ...PROP_STRING}],
                ['enablenext', {value: false, ...PROP_BOOLEAN}],
                ['name', PROP_STRING],
                ['nextbtnlabel', {value: 'Next', ...PROP_STRING}],
                ['nodatamessage', {value: 'No Data Found', ... PROP_STRING}],
                ['previousbtnlabel', {value: 'Previous', ...PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['stepstyle', {value: 'auto', ...PROP_STRING}],
                ['type', PROP_STRING]
            ]
        )
    );
};
