import { _WM_APP_PROJECT, hasCordova, isIE, getWmProjectProperties } from '@wm/core';
import {trigger} from "@angular/animations";

declare const moment, _;

const accessTokenSuffix = '.access_token', pkceIdentifier = 'pkce', implicitIdentifier = 'implicit';

let code_verifier, redirectUri;

export const parseConfig = (serviceParams: any): any => {

    let val, param, config;
    const urlParams = serviceParams.urlParams;

    config = {
        url: 'services/oauth2/:providerId/authorizationUrl',
        method: 'GET'
    };

    /*To handle dynamic urls, append the serviceParams.config.url with the static url(i.e., config.url)*/
    if (serviceParams.config) {
        config.url = (serviceParams.config.url || '') + config.url;
        config.method = serviceParams.config.method || config.method;
        config.headers = config.headers || {};

        // TODO[Shubham] - change to for - of
        for (const key in serviceParams.config.headers) {
            val = serviceParams.config.headers[key];
            config.headers[key] = val;
        }
    }
    /* check for url parameters to replace the url */
    if (urlParams) {
        for (param in urlParams) {
            if (urlParams.hasOwnProperty(param)) {
                val = urlParams[param];
                if (!_.isUndefined(val) && val !== null) {
                    config.url = config.url.replace(new RegExp(':' + param, 'g'), val);
                }
            }
        }
    }

    /* check for data */
    if (serviceParams.params) {
        config.params = serviceParams.params;
    }
    /* check for data */
    if (!_.isUndefined(serviceParams.data)) {
        config.data = serviceParams.data;
    }
    /* check for data parameters, written to support old service calls (.json calls) */
    if (serviceParams.dataParams) {
        config.data.params = serviceParams.dataParams;
    }
    /* check for headers */
    if (serviceParams.headers) {
        config.headers = serviceParams.headers;
    }

    /* set extra config flags */
    config.byPassResult    = serviceParams.byPassResult;
    config.isDirectCall    = serviceParams.isDirectCall;
    config.isExtURL        = serviceParams.isExtURL;
    config.preventMultiple = serviceParams.preventMultiple;
    config.responseType    = serviceParams.responseType;

    return config;
};

const listeners = {},
    ACCESSTOKEN_PLACEHOLDERS = {
        'STUDIO': 'WM_STUDIO_',
        'RUN': 'WM_RUN_'
    },
    newWindowProps = 'width=400,height=600';

/**
 * This function remove the accessToken for a provider
 * @param provider
 */
export const removeAccessToken = (provider) => {
    const accessTokenKey = getAccessTokenPlaceholder(provider);
    sessionStorage.removeItem(accessTokenKey);
};

/**
 * This function returns the accesstoken placeholder based on the studio or run mode for the project
 * @param provider
 * @returns {*}
 */
function getAccessTokenPlaceholder(provider) {
    let accessTokenKey;
    accessTokenKey = ACCESSTOKEN_PLACEHOLDERS.RUN + _WM_APP_PROJECT.id + '_' + provider + accessTokenSuffix;
    return accessTokenKey;
}

/**
 * This function performs the fake local storage update, so the IE gets the latest token instead of returning the cached localStorageValue
 */
function performFakeLocalStorageUpdate() {
    const dummy_key = 'dummy_key';
    localStorage.setItem(dummy_key, dummy_key);
    localStorage.removeItem(dummy_key);
}

/**
 * This function sets the accessToken
 * @param provider
 * @param accesstoken
 */
function setAccessToken(provider, accesstoken) {
    const accessTokenKey = getAccessTokenPlaceholder(provider);
    sessionStorage.setItem(accessTokenKey, accesstoken);
}

/**
 * this is a callback function to check if the authentication is done and invokes the successCallback
 * @param providerId
 * @param successCallback
 * @param evt
 */
function checkAuthenticationStatus(providerId, successCallback, removeProviderConfigCallBack, evt, http?, securityObj?) {
    const accessTokenKey = providerId + accessTokenSuffix,
        accessTokenOrCode = localStorage.getItem(accessTokenKey);
    if (evt && evt.origin !== window.location.origin) {
        return;
    }
    if (accessTokenOrCode) {
        if (isPassedFlow(securityObj, pkceIdentifier)) {
            const req = 'client_id=' + securityObj.clientId + '&code=' + accessTokenOrCode + '&grant_type=authorization_code&code_verifier=' + code_verifier + '&redirect_uri=' + redirectUri;
            http.send({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                url: securityObj.accessTokenUrl,
                data: req
            }).then(function(response) {
                triggerAccessTokenSuccessCallback(providerId, successCallback, removeProviderConfigCallBack, accessTokenKey, response.body.access_token);
            });
        } else {
            triggerAccessTokenSuccessCallback(providerId, successCallback, removeProviderConfigCallBack, accessTokenKey, accessTokenOrCode);
        }
    }
}

/**
 * function trigger the successCallback after getting the access token
 */
function triggerAccessTokenSuccessCallback(providerId, successCallback, removeProviderConfigCallBack, accessTokenKey, token) {
    removeProviderConfigCallBack(providerId);
    localStorage.removeItem(accessTokenKey);
    setAccessToken(providerId, token);
    window.removeEventListener('message', listeners[providerId]);
    setTimeout(() => {
        delete listeners[providerId];
        if (successCallback) {
            successCallback(token);
        }
    });
}

/**
 * this function keeps on checking the accesstoken in the LocalStorage and updates it accordingly
 * @param providerId
 * @param onSuccess
 * @param onError
 * @param startTime
 * @param loginObj
 */
function checkAccessTokenInWindow(providerId, onSuccess, onError, startTime, loginObj, removeProviderConfigCallBack) {
    performFakeLocalStorageUpdate();
    const currentTime = moment.duration(moment().format('HH:mm'), 'HH:mm'),
        timeDiff = currentTime.subtract(startTime),
        accessToken = getAccessToken(providerId, true);
    if (accessToken) {
        loginObj.accesstoken_retrieved = true;
        setAccessToken(providerId, accessToken);
        localStorage.removeItem(providerId + accessTokenSuffix);
        removeProviderConfigCallBack(providerId);
        if (onSuccess) {
            onSuccess();
        }
    } else if (timeDiff.minutes() > 1 && onSuccess && !loginObj.accesstoken_retrieved) {
        onSuccess('error');
    } else {
        setTimeout(() => {
            checkAccessTokenInWindow(providerId, onSuccess, onError, startTime, loginObj, removeProviderConfigCallBack);
        }, 3000);
    }
}

/**
 * checks for the window existence i.e if the window is manually closed by the user or any such
 * @param oAuthWindow
 * @param provider
 * @param callback
 */
function checkForWindowExistence(oAuthWindow, provider, callback, providerInfo?) {
    if (oAuthWindow && listeners[provider]) {
        if (!oAuthWindow.closed) { // .closed is supported across major browser vendors however for IE the user has to enable protected mode from security options
            setTimeout(checkForWindowExistence.bind(undefined, oAuthWindow, provider, callback, providerInfo), 3000);
        } else {
            if (!isPassedFlow(providerInfo, pkceIdentifier)) {
                window.removeEventListener('message', listeners[provider]);
                delete listeners[provider];
                if (callback) {
                    callback('error');
                }
            }
        }
    }
}
/**
 * this functions handles the logic related to the window operations in IE
 * @param url
 * @param providerId
 * @param onSuccess
 * @param onError
 */
function handleLoginForIE(url, providerId, onSuccess, onError, removeProviderConfigCallBack, securityObj?, requestSourceType?, customUriScheme?, deployedURL?) {
    const loginObj = {
        'accesstoken_retrieved': false
    };
    if (isPassedFlow(securityObj, implicitIdentifier)) {
        url = constructURLForImplicitOrPKCE(providerId, securityObj, requestSourceType, null, customUriScheme, deployedURL);
    }
    window.open(url, '_blank', newWindowProps);
    checkAccessTokenInWindow(providerId, onSuccess, onError, moment.duration(moment().format('HH:mm'), 'HH:mm'), loginObj, removeProviderConfigCallBack);
}

/**
 * this functions returns if the current oAuth Flow matches the passed flow or not
 * @param providerInfo
 */
function isPassedFlow(providerInfo, flow) {
    let oAuthFlow = _.get(providerInfo, 'oauth2Flow');
    oAuthFlow = oAuthFlow ? oAuthFlow.toLowerCase() : oAuthFlow;
    if (flow === pkceIdentifier) {
        if (_.get(providerInfo, 'oAuth2Pkce.enabled') === true) {
            oAuthFlow = pkceIdentifier;
        }
    }
    return oAuthFlow === flow;
}

/**
 * this function adds the listener on the window and assigns the listener
 * @param provider
 * @param callback
 */
function onAuthWindowOpen(provider, callback, removeProviderConfigCallBack, http?, securityObj?) {
    listeners[provider] = checkAuthenticationStatus.bind(undefined, provider, callback, removeProviderConfigCallBack, null, http, securityObj);
    window.addEventListener('message', listeners[provider], false);
}

// Generate a secure random string using the browser crypto functions
function generateRandomString() {
    const array = new Uint32Array(28);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

// Returns a promise that resolves to an ArrayBuffer
function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

// Base64-urlencodes the input string
function base64urlencode(str) {
    // Convert the ArrayBuffer to string using Uint8 array to convert to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * this function is a callback function which enables the listener and checks for the window existence
 * @param providerId
 * @param onSuccess
 * @param url
 */
function postGetAuthorizationURL(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj?, requestSourceType?, customUriScheme?, deployedURL?, http?) {
    if (isPassedFlow(securityObj, implicitIdentifier)) {
        url = constructURLForImplicitOrPKCE(providerId, securityObj, requestSourceType, null, customUriScheme, deployedURL);
        startoAuthFlow(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL, http);
    } else if (isPassedFlow(securityObj, pkceIdentifier)) {
        // Create and store a new PKCE code_verifier (the plaintext random secret)
        code_verifier = generateRandomString();
        let code_challenge;
        if (_.get(securityObj, 'oAuth2Pkce.challengeMethod') === 'plain') {
            code_challenge = code_verifier;
            url = constructURLForImplicitOrPKCE(providerId, securityObj, requestSourceType, code_challenge, customUriScheme, deployedURL);
            startoAuthFlow(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL, http);
        } else {
            sha256(code_verifier).then(function(v) {
                code_challenge = base64urlencode(v);
                url = constructURLForImplicitOrPKCE(providerId, securityObj, requestSourceType, code_challenge, customUriScheme, deployedURL);
                startoAuthFlow(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL, http);
            });
        }
    } else {
        startoAuthFlow(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL, http);
    }
}

function startoAuthFlow(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj?, requestSourceType?, customUriScheme?, deployedURL?, http?) {
    let oAuthWindow;
    if (hasCordova()) {
        window.open(url, '_system');
        window['OAuthInMobile'](providerId).then(accessToken => {
            const key = providerId + accessTokenSuffix;
            if (accessToken) {
                localStorage.setItem(key, accessToken);
                checkAuthenticationStatus(providerId, onSuccess, removeProviderConfigCallBack, null, http, securityObj);
            } else {
                onSuccess('error');
            }
        });
    } else {
        oAuthWindow = window.open(url, '_blank', newWindowProps);
        onAuthWindowOpen(providerId, onSuccess, removeProviderConfigCallBack, http, securityObj);
        checkForWindowExistence(oAuthWindow, providerId, onSuccess, securityObj);
    }
}

/**
 * function to construct the url for implicit flow.
 * @param providerId provider id for which the url has to be set
 * @param providerInfo provider object which contains details such as scope, client id etc
 * @param requestSourceType requesting source is web or mobile or wavelens
 * @returns url string
 */
function constructURLForImplicitOrPKCE(providerId, providerInfo, requestSourceType, code_challenge, customUriScheme?, deployedURL?) {
    redirectUri = window.location.href.split('/#/')[0] + '/oAuthCallback.html';
    const clientId = providerInfo.clientId;
    const scopes = providerInfo.scopes.map(function(scope) { return scope.name }).join(' ');
    let state;
    if (getWmProjectProperties().isTestRuntime === true) {
        redirectUri = location.protocol + '//' + window.location.host + '/studio/oAuthCallback.html';
    }
    // for mobile apps and wavelens, location.href will not give us the correct url, so fetching it from deployedURL(config.json) instead
    if (requestSourceType === 'MOBILE' || requestSourceType === 'WAVELENS') {
        redirectUri = deployedURL + 'oAuthCallback.html';
    }
    const flow = isPassedFlow(providerInfo, implicitIdentifier) ? implicitIdentifier : pkceIdentifier;
    state = {providerId: providerId, suffix: accessTokenSuffix, requestSourceType: requestSourceType, flow: flow, scheme: customUriScheme};
    const commonUrl = providerInfo.authorizationUrl + '?client_id=' + clientId + '&redirect_uri=' + redirectUri + '&state=' + encodeURIComponent(JSON.stringify(state)) + '&scope=' + encodeURIComponent(scopes);
    let url;
    if (flow === implicitIdentifier) {
        url = commonUrl + '&response_type=token';
    } else {
        url = commonUrl + '&response_type=code&code_challenge=' + code_challenge + '&code_challenge_method=' + _.get(providerInfo, 'oAuth2Pkce.challengeMethod');
    }
    return url;
}

/**
 * function to get the authorization url
 * @param params provider id for which the auth url has to be fetched
 * @param successCallback callback to be invoked upon successful fetch of the providers
 * @param failureCallback callback to be invoked upon error
 * @returns {*}
 */
function getAuthorizationUrl(params, http) {
    const action = 'getAuthorizationUrl',
        serviceSettings = parseConfig({
            target: 'oauthConfiguration',
            action: action,
            urlParams: {
                projectId: _WM_APP_PROJECT.id,
                providerId: params.providerId
            },
            params: {
                'requestSourceType': params.requestSourceType
            }
        });
    return http.send(serviceSettings);
}

/**
 * function trigger the addProviderConfigCallBack after getting the authorization url
 */
function triggerProviderConfigCallBack(url, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL) {
    const urlBody = isPassedFlow(securityObj, implicitIdentifier) || isPassedFlow(securityObj, pkceIdentifier) ? url : url.body;
    addProviderConfigCallBack({
        name: providerId,
        url: urlBody,
        invoke: () => {
            if (isIE()) { // handling for IE
                handleLoginForIE(url, providerId, onSuccess, onError, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL);
            } else {
                postGetAuthorizationURL(urlBody, providerId, onSuccess, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL, http);
            }
        }
    });
}

/**
 * this function retrieves the accessToken based on the run/studiomode
 * @param provider
 * @returns {*}
 */
export const getAccessToken = (provider, checkLocalStorage) => {
    const accessTokenKey = getAccessTokenPlaceholder(provider);
    if (checkLocalStorage) {
        return localStorage.getItem(provider + accessTokenSuffix);
    }
    return sessionStorage.getItem(accessTokenKey);
};


/**
 * this function is used to perform the authorization by opening the window and having active listeners
 * @param url
 * @param providerId
 * @param onSuccess
 * @returns {*}
 */
export const performAuthorization = (url, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack, securityObj?, customUriScheme?, deployedURL?) => {
    let requestSourceType = 'WEB';
    if (url) {
        if (isIE()) { // handling for IE
            handleLoginForIE(url, providerId, onSuccess, onError, removeProviderConfigCallBack);
        } else {
            postGetAuthorizationURL(url, providerId, onSuccess, removeProviderConfigCallBack, securityObj, requestSourceType, http);
        }
    } else {
        if (window['WaveLens']) {
            requestSourceType = 'WAVELENS';
        } else if (hasCordova()) {
            requestSourceType = 'MOBILE';
        }
        if (isPassedFlow(securityObj, implicitIdentifier) || isPassedFlow(securityObj, pkceIdentifier)) {
            triggerProviderConfigCallBack(url, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL);
        } else {
            return getAuthorizationUrl({
                'providerId': providerId,
                'requestSourceType': requestSourceType
            }, http).then((response) => {
                triggerProviderConfigCallBack(response, providerId, onSuccess, onError, http, addProviderConfigCallBack, removeProviderConfigCallBack, securityObj, requestSourceType, customUriScheme, deployedURL);
            });
        }
    }
};
