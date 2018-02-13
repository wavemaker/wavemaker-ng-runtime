import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class NavigationVariableService {
    constructor(private router: Router) {
    }

    navigate(pageName: string) {
        this.router.navigate([`/${pageName}`]);
    }
}
