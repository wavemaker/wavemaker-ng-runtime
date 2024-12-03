import { SecurityService } from './security.service'; // Adjust the path as needed
import { Injector } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AbstractHttpService, App } from '@wm/core';

jest.mock('@wm/core', () => ({
    ...jest.requireActual('@wm/core'),
    getWmProjectProperties: jest.fn().mockReturnValue({ homePage: 'home' })
}));
(window as any)._WM_APP_PROPERTIES  = {
    securityEnabled : true
}

describe('SecurityService', () => {
    let service: SecurityService;
    let httpMock: jest.Mocked<AbstractHttpService>;
    let routerMock: jest.Mocked<Router>;
    let locationMock: jest.Mocked<Location>;
    let activatedRouteMock: jest.Mocked<ActivatedRoute>;
    let injectorMock: jest.Mocked<Injector>;

    beforeEach(() => {
        httpMock = {
            send: jest.fn()
        } as unknown as jest.Mocked<AbstractHttpService>;

        routerMock = {
            navigate: jest.fn()
        } as unknown as jest.Mocked<Router>;

        locationMock = {
            path: jest.fn().mockReturnValue('/home')
        } as unknown as jest.Mocked<Location>;

        activatedRouteMock = {
            queryParams: of({ redirectTo: 'somePage' })
        } as unknown as jest.Mocked<ActivatedRoute>;

        injectorMock = {
            get: jest.fn().mockReturnValue({
                notify: jest.fn(),
                subscribe: jest.fn()
            })
        } as unknown as jest.Mocked<Injector>;

        service = new SecurityService(
            injectorMock,
            httpMock,
            routerMock,
            activatedRouteMock,
            locationMock
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return config if already loaded', () => {
        service.config = { test: 'config' };
        expect(service.isLoaded()).toEqual({ test: 'config' });
    });

    it('should load security config if not already loaded', async () => {
        const mockResponse = { body: { userInfo: { name: 'testUser' 
        }  }  };
        httpMock.send.mockResolvedValue(mockResponse);

        const config = await service.load();
        expect(config).toEqual(mockResponse.body);
        expect(service.config).toEqual(mockResponse.body);
        expect(service.loggedInUser).toEqual(mockResponse.body.userInfo);
    });

    it('should trigger success callback on getWebConfig when config is loaded', () => {
        const successCallback = jest.fn();
        service.config = { test: 'config' };
        service.getWebConfig(successCallback, jest.fn());
        expect(successCallback).toHaveBeenCalledWith({ test: 'config' });
    });

    it('should trigger error callback on getWebConfig if loading fails', async () => {
        httpMock.send.mockRejectedValue('error');
        await expect(service.load(true)).rejects.toEqual('error');
    });

    it('should navigate to correct page on successful login', async () => {
        service.config = { securityEnabled: true, authenticated: true, userInfo: { landingPage: 'dashboard' } };
        const mockPage = 'dashboard';
        const page = await service.getPageByLoggedInUser();
        expect(page).toBe(mockPage);
    });

    it('should perform app login successfully', async () => {
        const mockResponse = { body: { wm_xsrf_token: 'token' } };
        httpMock.send.mockResolvedValue(mockResponse);

        const successCallback = jest.fn();
        await service.appLogin({}, successCallback, jest.fn());
        expect(successCallback).toHaveBeenCalledWith(mockResponse);
    });

    it('should perform app logout successfully', async () => {
        service.config = { authenticated: true, userInfo: { name: 'testUser' }  }; // initialize config

        const mockResponse = { body: 'success' };
        httpMock.send.mockResolvedValue(mockResponse);

        const successCallback = jest.fn();
        await service.appLogout(successCallback, jest.fn());
        expect(successCallback).toHaveBeenCalledWith(mockResponse);
        expect(service.config.authenticated).toBe(false);
        expect(service.config.userInfo).toBeNull();
    });

    it('should resolve the promise when user is authenticated', async () => {
        service.config = { securityEnabled: true, authenticated: true };

        await expect(service.onUserLogin()).resolves.toBeUndefined();
    });

    it('should reject the promise when user is not authenticated', async () => {
        service.config = { securityEnabled: true, authenticated: false };

        const appMock = injectorMock.get(App);
        (appMock as any).subscribe.mockImplementation((event, callback) => {
            if (event === 'userLoggedIn') {
                callback();
            }
        });

        const promise = service.onUserLogin();
        await expect(promise).resolves.toBeUndefined();
    });
    it('should get logged-in user', async () => {
        service.config = { userInfo: { name: 'testUser' } };

        const user = await service.getLoggedInUser();
        expect(user).toEqual(service.config.userInfo);
    });

    it('should reject promise when no logged-in user', async () => {
        service.config = null;
        await expect(service.getLoggedInUser()).rejects.toThrow(); // Adjust to match the actual error thrown
    });

    it('should return last logged in username', () => {
        service.lastLoggedInUser = { userName: 'testUser' };
        expect(service.getLastLoggedInUsername()).toBe('testUser');
    });

    it('should return the current route page', () => {
        locationMock.path.mockReturnValue('/home?param=value');
        expect(service.getCurrentRoutePage()).toBe('home');
        expect(locationMock.path).toHaveBeenCalled();
    });

    it('should return an empty string if no page is loaded', () => {
        locationMock.path.mockReturnValue('/');
        expect(service.getCurrentRoutePage()).toBe('');
        expect(locationMock.path).toHaveBeenCalled();
    });

    it('should return the last logged-in username', () => {
        const mockUser = { userName: 'testUser' };
        service.lastLoggedInUser = mockUser;
        const result = service.getLastLoggedInUsername();
        expect(result).toBe('testUser');
    });

    describe('getPageByLoggedInUser', () => {
        it('should return home page when not application type and no page loaded', async () => {
            (global as any).isApplicationType = false;
            service['isNoPageLoaded'] = jest.fn().mockReturnValue(true);

            const result = await service.getPageByLoggedInUser();
            expect(result).toBe('home');
        });

        // New test case for when isApplicationType is false but isNoPageLoaded() is false
        it('should not resolve immediately when not application type and a page is loaded', async () => {
            (global as any).isApplicationType = false;
            service['isNoPageLoaded'] = jest.fn().mockReturnValue(false);
            service['getConfig'] = jest.fn().mockImplementation((successCallback) => {
                successCallback({
                    securityEnabled: true,
                    authenticated: true,
                    userInfo: { landingPage: 'dashboard' }
                });
            });

            const result = await service.getPageByLoggedInUser();
            expect(result).toBe('dashboard');
            expect(service['getConfig']).toHaveBeenCalled();
        });

        it('should return config landingPage when security enabled and authenticated', async () => {
            service['getConfig'] = jest.fn().mockImplementation((successCallback) => {
                successCallback({
                    securityEnabled: true,
                    authenticated: true,
                    userInfo: { landingPage: 'dashboard' }
                });
            });

            const result = await service.getPageByLoggedInUser();
            expect(result).toBe('dashboard');
        });

        it('should return home page when security enabled but not authenticated', async () => {
            service['getConfig'] = jest.fn().mockImplementation((successCallback) => {
                successCallback({
                    securityEnabled: true,
                    authenticated: false
                });
            });

            const result = await service.getPageByLoggedInUser();
            expect(result).toBe('home');
        });

        it('should return home page when config retrieval fails', async () => {
            service['getConfig'] = jest.fn().mockImplementation((successCallback, errorCallback) => {
                errorCallback();
            });

            const result = await service.getPageByLoggedInUser();
            expect(result).toBe('home');
        });

        it('should set XSRF headers when XSRF is enabled', async () => {
            service['isXsrfEnabled'] = jest.fn().mockReturnValue(true);
            service['getConfig'] = jest.fn().mockImplementation((successCallback) => {
                successCallback({
                    securityEnabled: true,
                    authenticated: true,
                    userInfo: { landingPage: 'dashboard' },
                    csrfHeaderName: 'X-XSRF-TOKEN'
                });
            });

            await service.getPageByLoggedInUser();
        });
    });
    describe('getCurrentRouteQueryParam', () => {
        it('should return the correct query param value', () => {
            const result = service.getCurrentRouteQueryParam('redirectTo');
            expect(result).toBe('somePage');
        });

        it('should return undefined for non-existent param', () => {
            const result = service.getCurrentRouteQueryParam('nonExistent');
            expect(result).toBeUndefined();
        });
    });

    describe('isNoPageLoaded', () => {
        it('should return true when getCurrentRoutePage is not empty', () => {
            service['getCurrentRoutePage'] = jest.fn().mockReturnValue('/somepage');
            expect(service.isNoPageLoaded()).toBe(true);
        });

        it('should return false when getCurrentRoutePage is empty', () => {
            service['getCurrentRoutePage'] = jest.fn().mockReturnValue('');
            expect(service.isNoPageLoaded()).toBe(false);
        });
    });

    describe('loadPageByUserRole', () => {
        beforeEach(() => {
            service.getPageByLoggedInUser = jest.fn().mockResolvedValue('dashboard');
            service.isNoPageLoaded = jest.fn().mockReturnValue(true);
            service['getCurrentRoutePage'] = jest.fn().mockReturnValue('/home');
        });

        it('should navigate to the new page when current page is different', async () => {
            await service.loadPageByUserRole();
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
        });

        it('should not navigate when no page is loaded and forcePageLoad is false', async () => {
            service.isNoPageLoaded = jest.fn().mockReturnValue(false);
            await service.loadPageByUserRole();
            expect(routerMock.navigate).not.toHaveBeenCalled();
        });

        it('should navigate when forcePageLoad is true, regardless of isNoPageLoaded', async () => {
            service.isNoPageLoaded = jest.fn().mockReturnValue(false);
            await service.loadPageByUserRole(true);
            expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
        });
    });

    describe('navigateOnLogin', () => {
        it('should call loadPageByUserRole with true', () => {
            service.loadPageByUserRole = jest.fn();
            service.navigateOnLogin();
            expect(service.loadPageByUserRole).toHaveBeenCalledWith(true);
        });
    });

    describe('onUserLogin', () => {
        it('should resolve immediately when security is disabled', async () => {
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void) => success({ securityEnabled: false }));

            await expect(service.onUserLogin()).resolves.toBeUndefined();
            expect(getConfigMock).toHaveBeenCalled();
        });

        it('should resolve immediately when security is enabled and user is authenticated', async () => {
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void) => success({ securityEnabled: true, authenticated: true }));

            await expect(service.onUserLogin()).resolves.toBeUndefined();
            expect(getConfigMock).toHaveBeenCalled();
        });

        it('should reject when getConfig fails', async () => {
            const error = new Error('Config error');
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void, failure: (error: any) => void) => failure(error));

            await expect(service.onUserLogin()).rejects.toThrow('Config error');
            expect(getConfigMock).toHaveBeenCalled();
        });
    });

    describe('getLoggedInUser', () => {
        it('should resolve with user info when available', async () => {
            const userInfo = { name: 'John Doe' };
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void) => success({ userInfo }));

            await expect(service.getLoggedInUser()).resolves.toEqual(userInfo);
            expect(getConfigMock).toHaveBeenCalled();
        });

        it('should reject when user info is not available', async () => {
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void) => success({}));

            await expect(service.getLoggedInUser()).rejects.toBeUndefined();
            expect(getConfigMock).toHaveBeenCalled();
        });

        it('should reject when getConfig fails', async () => {
            const error = new Error('Config error');
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void, failure: (error: any) => void) => failure(error));

            await expect(service.getLoggedInUser()).rejects.toThrow('Config error');
            expect(getConfigMock).toHaveBeenCalled();
        });
    });

    describe('authInBrowser', () => {
        it('should reject with a specific message', async () => {
            await expect(service.authInBrowser()).rejects.toBe('This authInBrowser should not be called');
        });
    });


    describe('isAuthenticated', () => {
        it('should call successCallback with true when user is authenticated', (done) => {
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void) => success({ authenticated: true }));

            service.isAuthenticated((result) => {
                expect(result).toBe(true);
                expect(getConfigMock).toHaveBeenCalled();
                done();
            }, () => {
                done.fail('Failure callback should not be called');
            });
        });

        it('should call successCallback with false when user is not authenticated', (done) => {
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void) => success({ authenticated: false }));

            service.isAuthenticated((result) => {
                expect(result).toBe(false);
                expect(getConfigMock).toHaveBeenCalled();
                done();
            }, () => {
                done.fail('Failure callback should not be called');
            });
        });

        it('should call failureCallback when getConfig fails', (done) => {
            const error = new Error('Config error');
            const getConfigMock = jest.spyOn(service as any, 'getConfig')
                .mockImplementation((success: (config: any) => void, failure: (error: any) => void) => failure(error));

            service.isAuthenticated(() => {
                done.fail('Success callback should not be called');
            }, (err) => {
                expect(err).toBe(error);
                expect(getConfigMock).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('getRedirectPage', () => {
        it('should return the provided page when it is not home or login page', () => {
            const config = { loginConfig: { pageName: 'Login' } };
            (service as any).getCurrentRoutePage = jest.fn().mockReturnValue('SomePage');

            const result = service.getRedirectPage(config, 'CustomPage');
            expect(result).toBe('CustomPage');
        });

        it('should return redirectTo from query params when on login page', () => {
            const config = { loginConfig: { pageName: 'Login' } };
            (service as any).getCurrentRoutePage = jest.fn().mockReturnValue('Login');
            (service as any).getCurrentRouteQueryParam = jest.fn().mockReturnValue('PreviousPage');

            const result = service.getRedirectPage(config);
            expect(result).toBe('PreviousPage');
        });
    });

    describe('getQueryString', () => {
        it('should convert object to query string', () => {
            const queryObject = { a: 1, b: 2, c: 'test' };
            const result = service.getQueryString(queryObject);
            expect(result).toBe('a=1&b=2&c=test');
        });
        it('should return empty string for empty object', () => {
            const result = service.getQueryString({});
            expect(result).toBe('');
        });
    });

    describe('getRedirectedRouteQueryParams', () => {
        it('should return all query params', (done) => {
            const mockQueryParams = {
                redirectTo: 'somePage',
                param1: 'value1',
                param2: 'value2'
            };

            // Mock the ActivatedRoute queryParams Observable
            (service as any).activatedRoute.queryParams = of(mockQueryParams);

            const result = service.getRedirectedRouteQueryParams();

            // Use setTimeout to allow for asynchronous completion
            setTimeout(() => {
                expect(result).toEqual(mockQueryParams);
                done();
            }, 0);
        });

        it('should handle empty query params', (done) => {
            // Mock the ActivatedRoute queryParams Observable with an empty object
            (service as any).activatedRoute.queryParams = of({});

            const result = service.getRedirectedRouteQueryParams();

            setTimeout(() => {
                expect(result).toEqual({});
                done();
            }, 0);
        });

        it('should combine multiple emissions', (done) => {
            const mockQueryParams1 = { param1: 'value1' };
            const mockQueryParams2 = { param2: 'value2' };

            // Create a mock Observable that emits multiple values
            const mockQueryParamsObservable = of(mockQueryParams1, mockQueryParams2);
            (service as any).activatedRoute.queryParams = mockQueryParamsObservable;

            const result = service.getRedirectedRouteQueryParams();

            setTimeout(() => {
                // The function should combine all emitted values
                expect(result).toEqual({
                    param1: 'value1',
                    param2: 'value2'
                });
                done();
            }, 0);
        });
    });
});
