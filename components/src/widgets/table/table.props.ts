import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, PROP_BOOLEAN_NOTIFY, register } from '../base/framework/widget-props';

export const registerProps = () => {
    register(
        'wm-table',
        new Map(
            [
                ['class', PROP_STRING],
                ['confirmdelete', {value: 'Are you sure you want to delete this?', ...PROP_STRING}],
                ['dataset', PROP_STRING_NOTIFY],
                ['deletemessage', {value: 'Record deleted successfully', ...PROP_STRING}],
                ['editmode', PROP_STRING],
                ['enablecolumnselection', {value: false, ...PROP_BOOLEAN}],
                ['enablesort', {value: true, ...PROP_BOOLEAN}],
                ['errormessage', PROP_STRING],
                ['exportformat', PROP_STRING],
                ['exportdatasize', {value: 100, ...PROP_NUMBER}],
                ['filtermode', PROP_STRING_NOTIFY],
                ['filternullrecords', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['formposition', PROP_STRING],
                ['gridclass', {value: 'table-bordered table-striped table-hover', ...PROP_STRING_NOTIFY}],
                ['gridfirstrowselect', PROP_BOOLEAN_NOTIFY],
                ['iconclass', PROP_STRING],
                ['insertmessage', {value: 'Record added successfully', ...PROP_STRING}],
                ['loadingdatamsg', {value: 'Loading...', ...PROP_STRING_NOTIFY}],
                ['loadingicon', {value: 'fa fa-spinner fa-spin', ...PROP_STRING_NOTIFY}],
                ['multiselect', PROP_BOOLEAN_NOTIFY],
                ['name', PROP_STRING],
                ['navigation', {value: 'Basic', ...PROP_STRING_NOTIFY}],
                ['navigationalign', {value: 'left', ...PROP_STRING}],
                ['nodatamessage', {value: 'No data found.', ...PROP_STRING_NOTIFY}],
                ['pagesize', PROP_NUMBER],
                ['radioselect', PROP_BOOLEAN_NOTIFY],
                ['rowclass', PROP_STRING],
                ['rowngclass', PROP_STRING],
                ['searchlabel', {value: 'Search', ...PROP_STRING}],
                ['show', PROP_BOOLEAN],
                ['showheader', {value: true, ...PROP_BOOLEAN_NOTIFY}],
                ['shownewrow', {value: true, ...PROP_BOOLEAN}],
                ['showrecordcount', PROP_BOOLEAN_NOTIFY],
                ['showrowindex', PROP_BOOLEAN_NOTIFY],
                ['spacing', {value: 'normal', ...PROP_STRING_NOTIFY}],
                ['subheading', PROP_STRING],
                ['tabindex', PROP_NUMBER],
                ['title', PROP_STRING],
                ['updatemessage', {value: 'Record updated successfully', ...PROP_STRING}]
            ]
        )
    );
};
