/*
 * Public API Surface of core
 */

export * from './utils/build-utils';
export * from './constants/currency-constants';
export {
    appendNode,
    insertBefore,
    insertAfter,
    removeNode,
    removeClass,
    addClass,
    switchClass,
    toggleClass,
    setCSS,
    setCSSFromObj,
    setProperty,
    setAttr,
    setHtml,
    removeAttr,
    createElement,
    toDimension
} from './utils/dom';
export * from './enums/enums';
export * from './utils/event-notifier';
export {
    ParseExprResult,
    setPipeProvider,
    $parseExpr,
    $parseEvent
} from './utils/expression-parser';
export {
    EVENT_LIFE,
    isDefined,
    isObject,
    toBoolean,
    isIE,
    isAndroid,
    isAndroidTablet,
    isIphone,
    isIpod,
    isIpad,
    isIos,
    isMobile,
    isMobileApp,
    getAndroidVersion,
    isKitkatDevice,
    encodeUrl,
    encodeUrlParams,
    initCaps,
    spaceSeparate,
    replaceAt,
    periodSeparate,
    prettifyLabel,
    deHyphenate,
    prettifyLabels,
    isInsecureContentRequest,
    stringStartsWith,
    getEvaluatedExprValue,
    isImageFile,
    isAudioFile,
    isVideoFile,
    isValidWebURL,
    getResourceURL,
    triggerFn,
    getFormattedDate,
    getDateObj,
    addEventListenerOnElement,
    getClonedObject,
    getFiles,
    generateGUId,
    validateAccessRoles,
    getValidJSON,
    xmlToJson,
    findValueOf,
    extractType,
    isNumberType,
    isEmptyObject,
    isPageable,
    replace,
    isDateTimeType,
    getValidDateObject,
    getNativeDateObject,
    getBlob,
    isEqualWithFields,
    loadStyleSheet,
    loadStyleSheets,
    loadScript,
    loadScripts,
    _WM_APP_PROJECT,
    setSessionStorageItem,
    getSessionStorageItem,
    noop,
    isArray,
    isString,
    isNumber,
    convertToBlob,
    hasCordova,
    isSpotcues,
    AppConstants,
    openLink,
    fetchContent,
    toPromise,
    retryIfFails,
    getAbortableDefer,
    createCSSRule,
    getUrlParams,
    getRouteNameFromLink,
    isAppleProduct,
    defer,
    executePromiseChain,
    isDataSourceEqual,
    validateDataSourceCtx,
    processFilterExpBindNode,
    extendProto,
    removeExtraSlashes,
    getDisplayDateTimeFormat,
    addForIdAttributes,
    adjustContainerPosition,
    adjustContainerRightEdges,
    setTranslation3dPosition,
    getWebkitTraslationMatrix,
    closePopover,
    detectChanges,
    triggerItemAction,
    getDatasourceFromExpr,
    extractCurrentItemExpr,
    findRootContainer,
    VALIDATOR,
    transformFileURI,
    appendScriptToHead,
    getAppSetting
} from './utils/utils';
export {
    FIRST_TIME_WATCH,
    isFirstTimeChange,
    debounce,
    muteWatchers,
    unMuteWatchers,
    $watch,
    $unwatch,
    setNgZone,
    setAppRef,
    isChangeFromWatch,
    resetChangeFromWatch,
    $invokeWatchers,
    $appDigest
} from './utils/watcher';
export * from './utils/id-generator';
export * from './types/types';
export * from './services/constant.service';
export * from './services/utils.service';
export * from './services/field-type.service';
export * from './services/field-widget.service';
export * from './services/script-loader.service';
export * from './services/user-custom-pipe-manager.service';
export {StatePersistence} from './services/state-persistence.service';
export * from './core.module';
export * from './utils/wm-project-properties';
export * from './utils/lru-cache';