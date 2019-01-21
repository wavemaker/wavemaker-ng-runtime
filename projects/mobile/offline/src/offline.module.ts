import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';

import { AbstractHttpService, App, hasCordova, noop } from '@wm/core';
import { DeviceFileService, DeviceFileUploadService, DeviceService, NetworkService } from '@wm/mobile/core';
import { SecurityService } from '@wm/security';

import { ChangeLogService, PushService } from './services/change-log.service';
import { LocalDBManagementService } from './services/local-db-management.service';
import { LocalKeyValueService } from './services/local-key-value.service';
import { LocalDBDataPullService } from './services/local-db-data-pull.service';
import { LocalDbService } from './services/local-db.service';
import { FileHandler, UploadedFilesImportAndExportService } from './services/workers/file-handler';
import { ErrorBlocker } from './services/workers/error-blocker';
import { IdResolver } from './services/workers/id-resolver';
import { MultiPartParamTransformer } from './services/workers/multi-part-param-transformer';
import { PushServiceImpl } from './services/push.service';
import { LiveVariableOfflineBehaviour } from './utils/live-variable.utils';
import { FileUploadOfflineBehaviour } from './utils/file-upload.utils';
import { NamedQueryExecutionOfflineBehaviour } from './utils/query-executor.utils';
import { SecurityOfflineBehaviour } from './utils/security.utils';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    exports: [],
    providers: [
        ChangeLogService,
        LocalDBDataPullService,
        LocalDBManagementService,
        LocalDbService,
        LocalKeyValueService,
        {provide: PushService, useClass: PushServiceImpl},
        SQLite
    ],
    entryComponents: []
})
export class OfflineModule {

    constructor(
        app: App,
        changeLogService: ChangeLogService,
        deviceService: DeviceService,
        deviceFileService: DeviceFileService,
        deviceFileUploadService: DeviceFileUploadService,
        file: File,
        httpService: AbstractHttpService,
        localDBManagementService: LocalDBManagementService,
        localDbService: LocalDbService,
        networkService: NetworkService,
        securityService: SecurityService
    ) {
        if (!hasCordova()) {
            return;
        }
        deviceService.addStartUpService({
            serviceName: 'OfflineStartupService',
            start: () => {
                if (window['SQLitePlugin']) {
                    localDBManagementService.setLogSQl((sessionStorage.getItem('wm.logSql') === 'true') || (sessionStorage.getItem('debugMode') === 'true'));
                    (window as any).logSql = (flag = true) => {
                        localDBManagementService.setLogSQl(flag);
                        sessionStorage.setItem('wm.logSql', flag ? 'true' : 'false');
                    };
                    (window as any).executeLocalSql = (dbName, query, params?) => {
                        localDBManagementService.executeSQLQuery(dbName, query, params, true);
                    };
                    return localDBManagementService.loadDatabases().then(() => {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                        changeLogService.addWorker({
                            onAddCall: () => {
                                if (!networkService.isConnected()) {
                                    networkService.disableAutoConnect();
                                }
                            },
                            postFlush: stats => {
                                if (stats.totalTaskCount > 0) {
                                    localDBManagementService.close()
                                        .catch(noop)
                                        .then(() => {
                                            location.assign(window.location.origin + window.location.pathname);
                                        });
                                }
                            }
                        });
                    });
                }
                return Promise.resolve();
            }
        });
        new SecurityOfflineBehaviour(app, file, deviceService, networkService, securityService).add();
    }
}
