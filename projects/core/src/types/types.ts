export enum ComponentType {
    PAGE,
    PREFAB,
    PARTIAL
}

export class IDataSource {
    execute: (operation: Operation, options?: any) => boolean | string | Promise<any>;
}

enum Operation {
    LIST_RECORDS = 'listRecords',
    UPDATE_RECORD = 'updateRecord',
    INSERT_RECORD = 'insertRecord',
    DELETE_RECORD = 'deleteRecord',
    INVOKE = 'invoke',
    UPDATE = 'update',
    NOTIFY = 'notify',
    IS_API_AWARE = 'isApiAware',
    SUPPORTS_CRUD = 'supportsCRUD',
    SUPPORTS_DISTINCT_API = 'supportsDistinctAPI',
    IS_PAGEABLE = 'isPageable',
    IS_SORTABLE = 'isSortable',
    GET_OPERATION_TYPE = 'getOperationType',
    GET_RELATED_PRIMARY_KEYS = 'getRelatedTablePrimaryKeys',
    GET_ENTITY_NAME = 'getEntityName',
    SET_INPUT = 'setinput',
    GET_RELATED_TABLE_DATA = 'getRelatedTableData',
    GET_DISTINCT_DATA_BY_FIELDS = 'getDistinctDataByFields',
    GET_AGGREGATED_DATA = 'getAggregatedData',
    GET_MATCH_MODE = 'getMatchMode',
    DOWNLOAD = 'download',
    GET_NAME = 'getName',
    GET_PROPERTIES_MAP = 'getPropertiesMap',
    GET_PRIMARY_KEY = 'getPrimaryKey',
    GET_BLOB_URL = 'getBlobURL',
    SUPPORTS_SERVER_FILTER = 'supportsServerFilter',
    GET_OPTIONS = 'getOptions',
    SEARCH_RECORDS = 'searchRecords',
    GET_REQUEST_PARAMS = 'getRequestParams',
    GET_PAGING_OPTIONS = 'getPagingOptions',
    FETCH_DISTINCT_VALUES = 'fetchDistinctValues',
    GET_UNIQUE_IDENTIFIER = 'getUniqueIdentifier',
    GET_CONTEXT_IDENTIFIER = 'getContextIdentifier',
    IS_UPDATE_REQUIRED = 'isUpdateRequired',
    ADD_ITEM = 'addItem',
    SET_ITEM = 'setItem',
    REMOVE_ITEM = 'removeItem',
    IS_BOUND_TO_LOCALE = 'isBoundToLocale',
    GET_DEFAULT_LOCALE = 'getDefaultLocale',
    CANCEL = 'cancel',
    SET_PAGINATION = 'setPagination'
}

export const DataSource = {
    Operation
};

export abstract class App {
    appLocale: any;
    Variables: any;
    Actions: any;
    onAppVariablesReady: Function;
    onSessionTimeout: Function;
    onBeforeAppReady: Function;
    onPageReady: Function;
    onBeforePageLeave: Function;
    onBeforeServiceCall: Function;
    onServiceSuccess: Function;
    onServiceError: Function;
    projectName: string;
    isPrefabType: boolean;
    isApplicationType: boolean;
    isTabletApplicationType: boolean;
    isTemplateBundleType: boolean;
    changeLocale: Function;
    getSelectedLocale: Function;
    setTimezone: Function;
    reload: Function;
    on401: Function;
    notifyApp: Function;
    getDependency: Function;
    networkStatus: any;
    notify: (eventName: string, data?: any) => void;
    deployedUrl: string;
    customUrlScheme: string;
    selectedViewPort: Object;
    subscribe: (eventName, callback: (data: any) => void) => () => void;
    dynamicComponentContainerRef: any;
    clearPageCache: (pageName?: string) => void;

    activePageName: string;
    activePage: any;
    Page: any;
    activePageLoadTime: number;
    landingPageName: string;
    lastActivePageName: string;
    deviceCategory: string;
}


export abstract class AbstractDialogService {
    public abstract register(name: string, dialogRef: any, scope: any);
    public abstract deRegister(name: string, scope: any);
    public abstract open(name: string, scope?: any, initState?: any);
    public abstract close(name: string, scope?: any);
    public abstract showAppConfirmDialog(initState?: any);
    public abstract closeAppConfirmDialog();
    public abstract getAppConfirmDialog();
    public abstract setAppConfirmDialog(dialogName: string);
    public abstract closeAllDialogs: Function;
    public abstract addToOpenedDialogs(ref: any);
    public abstract getLastOpenedDialog();
    public abstract removeFromOpenedDialogs(ref: any);
    public abstract getOpenedDialogs();
    public abstract addToClosedDialogs(ref: any);
    public abstract removeFromClosedDialogs(ref: any);
    public abstract getDialogRefFromClosedDialogs();
}

export abstract class AbstractHttpService {
    public abstract send(options: any);
    public abstract setLocale(locale);
    public abstract getLocale();
    public abstract parseErrors(errors);
    public abstract parseError(errorObj);
    public abstract getHeader(error, headerKey);
    public abstract isPlatformSessionTimeout(error);
    public abstract get(url: string, options?: any);
    public abstract post(url, data, options);
    public abstract put(url, data, options);
    public abstract patch(url, data, options);
    public abstract delete(url, options);
    public abstract head(url, options);
    public abstract jsonp(url, options);
    public abstract upload(url, data, options);
    public abstract registerOnSessionTimeout(callback);
    public abstract on401();
    public abstract pushToSessionFailureQueue(callback);
    public abstract executeSessionFailureRequests();
    public abstract sendCallAsObservable(options: any, params?: any): any;
}

export abstract class AbstractI18nService {
    public abstract getSelectedLocale(): string;
    public abstract getDefaultSupportedLocale(): string;
    public abstract getAppLocale(): any;
    public abstract setSelectedLocale(locale);
    public abstract loadDefaultLocale();
    public abstract getLocalizedMessage(message, ...args);
    public abstract initCalendarLocale(): Promise<any>;
    protected abstract loadAppLocaleBundle();
    protected abstract loadMomentLocaleBundle(localeLang);
    protected abstract loadLocaleBundles(localeLang);
    public abstract setTimezone(locale, compInstance?);
    public abstract getFormatsByLocale();
    public abstract getTimezone(compInstance?);
    public abstract getPrefabLocaleBundle(prefabName: string): any;
}

export abstract class AbstractToasterService {
    public abstract success(title: string, desc: string);
    public abstract error(title: string, desc: string);
    public abstract info(title: string, desc: string);
    public abstract warn(title: string, desc: string);
    public abstract show(
        type: string,
        title: string,
        desc: string,
        timeout: number,
        bodyOutputType: string,
        onClickHandler: Function,
        onHideCallback: Function
    );
    public abstract hide(toasterObj: any);
    public abstract showCustom(pageName: string, options?: any);
}

export abstract class AbstractSpinnerService {
    public abstract getMessageSource();
    public abstract showContextSpinner(spinnerContext: string, message: string, id: string);
    public abstract showAppSpinner(msg: string, id: string);
    public abstract hideContextSpinner(ctx: string, id: string);
    public abstract show(message: string, id?: string, spinnerClass?: string, spinnerContext?: string, variableScopeId?: string);
    public abstract hide(id: string);
}
export abstract class UserDefinedExecutionContext {

}

export interface NavigationOptions {
    $event?: any;
    pageName?: string;
    transition?: string;
    urlParams?: any;
    viewName?: string;
}

export abstract class AbstractNavigationService {
    public abstract getPageTransition(): string;
    public abstract goToPage(pageName: string, options: NavigationOptions);
    public abstract goToPrevious();
    public abstract goToView(viewName: string, options: NavigationOptions, variable: any);
}

export abstract class AppDefaults {
    public dateFormat;
    public timeFormat;
    public dateTimeFormat;
    public currencyCode;
    public abstract setFormats(formats: any);
}

export abstract class DynamicComponentRefProvider {
    public abstract getComponentFactoryRef(selector: string, markup: string, options?: any);
}

export abstract class PartialRefProvider {
    abstract getComponentFactoryRef(partialName: string, componentType: ComponentType, options?: any): Promise<any>;
}
