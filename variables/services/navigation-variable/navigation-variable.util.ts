import { routerService } from './../../utils/variables.utils';

export const navigate = (pageName: string) => {
    routerService.navigate([`/${pageName}`]);
};
