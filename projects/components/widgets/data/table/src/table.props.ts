import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const registerProps = () => {
    register(
        'wm-table',
        new Map(
            [
                ['boundarylinks', {value: false, ...PROP_BOOLEAN}],
                ['class', PROP_STRING],
                ['confirmdelete', {value: 'Are you sure you want to delete this?', ...PROP_STRING}],
                ['datasource', PROP_STRING],
                ['dataset', PROP_ANY],
                ['deletecanceltext', PROP_STRING],
                ['deleteoktext', PROP_STRING],
                ['deletemessage', {value: 'Record deleted successfully', ...PROP_STRING}],
                ['directionlinks', {value: true, ...PROP_BOOLEAN}],
                ['editmode', PROP_STRING],
                ['errorstyle', {value: 'hover', ...PROP_STRING}],
                ['enablecolumnselection', {value: false, ...PROP_BOOLEAN}],
                ['enablesort', {value: true, ...PROP_BOOLEAN}],
                ['errormessage', PROP_STRING],
                ['exportformat', PROP_STRING],
                ['exportdatasize', {value: 100, ...PROP_NUMBER}],
                ['filtermode', PROP_STRING],
                ['filternullrecords', {value: true, ...PROP_BOOLEAN}],
                ['forceellipses', {value: true, ...PROP_BOOLEAN}],
                ['formposition', PROP_STRING],
                ['gridclass', {value: 'table-hover', ...PROP_STRING}],
                ['gridfirstrowselect', PROP_BOOLEAN],
                ['iconclass', PROP_STRING],
                ['insertmessage', {value: 'Record added successfully', ...PROP_STRING}],
                ['isdynamictable', PROP_BOOLEAN], // internal property to determine dynamic table
                ['loadingdatamsg', {value: 'Loading...', ...PROP_STRING}],
                ['loadingicon', {value: 'fa fa-circle-o-notch fa-spin', ...PROP_STRING}],
                ['maxsize', {value: 5, ...PROP_NUMBER}],
                ['multiselect', PROP_BOOLEAN],
                ['name', PROP_STRING],
                ['navigation', {value: 'Basic', ...PROP_STRING}],
                ['navigationalign', {value: 'left', ...PROP_STRING}],
                ['nodatamessage', {value: 'No data found.', ...PROP_STRING}],
                ['pagesize', PROP_NUMBER],
                ['radioselect', PROP_BOOLEAN],
                ['rowclass', PROP_STRING],
                ['rowngclass', PROP_STRING],
                ['searchlabel', {value: 'Search', ...PROP_STRING}],
                ['show', {value: true, ...PROP_BOOLEAN}],
                ['showheader', {value: true, ...PROP_BOOLEAN}],
                ['shownewrow', {value: true, ...PROP_BOOLEAN}],
                ['showrecordcount', PROP_BOOLEAN],
                ['showrowindex', PROP_BOOLEAN],
                ['spacing', {value: 'normal', ...PROP_STRING}],
                ['statehandler', {value: 'none', ...PROP_STRING}],
                ['subheading', PROP_STRING],
                ['tabindex', {value: 0, ...PROP_NUMBER}],
                ['title', PROP_STRING],
                ['updatemessage', {value: 'Record updated successfully', ...PROP_STRING}]
            ]
        )
    );
};
