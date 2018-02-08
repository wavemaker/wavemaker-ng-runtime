import { PROP_BOOLEAN, PROP_NUMBER, PROP_STRING, PROP_STRING_NOTIFY, PROP_NUMBER_NOTIFY, register } from '../../utils/widget-props';

export const registerProps = () => {
    register(
        'wm-pagination',
        new Map(
            [
                ['boundarylinks', PROP_BOOLEAN],
                ['class', PROP_STRING],
                ['dataset', PROP_STRING_NOTIFY],
                ['directionlinks', PROP_BOOLEAN],
                ['forceellipses', PROP_BOOLEAN],
                ['maxResults', PROP_NUMBER_NOTIFY],
                ['maxsize', PROP_NUMBER_NOTIFY],
                ['name', PROP_STRING],
                ['navigation', PROP_STRING_NOTIFY],
                ['navigationalign', PROP_STRING_NOTIFY],
                ['navigationsize', PROP_NUMBER_NOTIFY],
                ['show', PROP_BOOLEAN],
                ['showrecordcount', PROP_BOOLEAN],
                ['tabindex', PROP_NUMBER]
            ]
        )
    );
};
