import { PROP_BOOLEAN, PROP_STRING_NOTIFY, PROP_STRING, register } from '../../framework/widget-props';

export const registerProps = () => {
    register(
        'wm-wizard',
        new Map(
            [
                ['actionsalignment', {value: 'right', ...PROP_STRING}],
                ['cancelable', {value: true, ...PROP_BOOLEAN}],
                ['cancelbtnlabel', {value: 'Cancel', ...PROP_STRING}],
                ['class', PROP_STRING],
                ['defaultstep', {value: 'none', ...PROP_STRING_NOTIFY}],
                ['donebtnlabel', {value: 'Done', ...PROP_STRING}],
                ['name', PROP_STRING],
                ['nextbtnlabel', {value: 'Next', ...PROP_STRING}],
                ['previousbtnlabel', {value: 'Previous', ...PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['stepstyle', {value: 'justified', ...PROP_STRING_NOTIFY}]
            ]
        )
    );
};
