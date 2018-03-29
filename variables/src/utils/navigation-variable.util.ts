import { routerService } from './variables.utils';

export const navigate = (pageName: string, pageParams: any) => {
    routerService.navigate([`/${pageName}`], { queryParams: pageParams});
};
