import { APP_INITIALIZER, NgModule } from "@angular/core";
import { HttpClientXsrfModule } from "@angular/common/http";
import { SecurityService } from "@wm/security";

export function initializeXsrfConfig(
    securityService: SecurityService
) {
    return async () => {
        try {
            await securityService.load();
            
            const xsrfCookieName = 
                (window as any)._WM_APP_PROPERTIES["securityInfo"]?.csrfCookieName 
                || "wm_xsrf_token";
            
            const xsrfHeaderName = 
                (window as any)._WM_APP_PROPERTIES["securityInfo"]?.csrfHeaderName 
                || null;

            const xsrfOptions: any = {
                cookieName: xsrfCookieName
            };

            if (xsrfHeaderName) {
                xsrfOptions.headerName = xsrfHeaderName;
            }

            HttpClientXsrfModule.withOptions(xsrfOptions);
        } catch (error) {
            console.error("Error initializing XSRF configuration", error);
        }
    };
}

@NgModule({
    imports: [HttpClientXsrfModule],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (
                securityService: SecurityService
            ) => initializeXsrfConfig(securityService),
            deps: [SecurityService],
            multi: true,
        },
    ],
})
export class XsrfConfigModule {}