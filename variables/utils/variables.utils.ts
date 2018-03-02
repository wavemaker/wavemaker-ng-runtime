import { $parse } from '@utils/expression-parser';

export let httpService;
export const setDependency = (type: string, ref: any) => {
    switch (type) {
        case 'http':
            httpService = ref;
            break;
    }
};

export const initiateCallback = (type: string, variable: any, data) => {
    // TODO: [Vibhu], check whether to support legacy event calling mechanism (ideally, it should have been migrated)
    const fn = $parse(variable[type]);
    fn(variable.scope, {$event: variable, $scope: data});
};