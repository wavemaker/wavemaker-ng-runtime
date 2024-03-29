import { PROP_ANY, PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, register } from '@wm/components/base';

export const navbarProps = new Map(
    [
        ['backbutton', {value: true, ...PROP_BOOLEAN}],
        ['backbuttoniconclass', {value: 'wi wi-back', ...PROP_STRING}],
        ['backbuttonlabel', {value: '', ...PROP_STRING}],
        ['backgroundattachment', PROP_STRING],
        ['backgroundcolor', PROP_STRING],
        ['backgroundgradient', PROP_STRING],
        ['backgroundimage', PROP_STRING],
        ['backgroundposition', PROP_STRING],
        ['backgroundrepeat', PROP_STRING],
        ['backgroundsize', PROP_STRING],
        ['class', PROP_STRING],
        ['datafield', {value: 'All Fields', ...PROP_STRING}],
        ['dataset', PROP_ANY],
        ['datasource', PROP_STRING],
        ['datavalue', PROP_STRING],
        ['debouncetime', {value: 250, ...PROP_NUMBER}],
        ['defaultview', PROP_STRING],
        ['displayimagesrc', PROP_STRING],
        ['displaylabel', PROP_STRING],
        ['imgsrc', PROP_STRING],
        ['query', {value: '', ...PROP_STRING}],
        ['leftnavpaneliconclass', {value: 'wm-sl-l sl-hamburger-menu', ...PROP_STRING}],
        ['matchmode', PROP_STRING],
        ['name', PROP_STRING],
        ['readonlySearchBar', PROP_BOOLEAN],
        ['searchbutton', {value: false, ...PROP_BOOLEAN}],
        ['searchbuttoniconclass', {value: 'wm-sl-l sl-search', ...PROP_STRING}],
        ['searchbuttonlabel', {value: '', ...PROP_STRING}],
        ['show', {value: true, ...PROP_BOOLEAN}],
        ['showLeftnavbtn', {value: true, ...PROP_BOOLEAN}],
        ['searchkey', PROP_STRING],
        ['searchplaceholder', {value: 'Search', ...PROP_STRING}],
        ['showSearchbar', PROP_BOOLEAN],
        ['title', PROP_STRING]
    ]
);

export const registerProps = () => {
    register(
        'wm-mobile-navbar',
        navbarProps
    );
};
