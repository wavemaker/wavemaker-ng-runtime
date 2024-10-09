import { PROP_BOOLEAN, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-wizard',
        new Map(
            [
                ['actionsalignment', {value: 'right', ...PROP_STRING}],
                ['cancelable', {value: true, ...PROP_BOOLEAN}],
                ['enablenext', {value: false, ...PROP_BOOLEAN}],
                ['cancelbtnlabel', {value: 'Cancel', ...PROP_STRING}],
                ['class', {value: 'classic', ...PROP_STRING}],
                ['defaultstep', {value: 'none', ...PROP_STRING}],
                ['donebtnlabel', {value: 'Done', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['nextbtnlabel', {value: 'Next', ...PROP_STRING}],
                ['previousbtnlabel', {value: 'Previous', ...PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['stepstyle', {value: 'auto', ...PROP_STRING}]
            ]
        )
    );
};
