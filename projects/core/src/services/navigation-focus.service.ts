import {Injectable, OnDestroy} from '@angular/core';
import {Event, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NavigationFocusService implements OnDestroy {
    private subscriptions = new Subscription();
    private navigationFocusRequests: HTMLElement[] = [];

    readonly navigationEndEvents = this.router.events
        .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd));

    constructor(private router: Router) {
        this.subscriptions.add(this.navigationEndEvents.subscribe(() => {
            setTimeout(() => {
                if (this.navigationFocusRequests.length) {
                    this.navigationFocusRequests[this.navigationFocusRequests.length - 1]
                        .focus({preventScroll: true});
                }
            }, 100);
        }));
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    requestFocusOnNavigation(el: HTMLElement) {
        this.navigationFocusRequests.push(el);
    }

    releaseFocusOnNavigation(el: HTMLElement) {
        this.navigationFocusRequests.splice(this.navigationFocusRequests.indexOf(el), 1);
    }
}
