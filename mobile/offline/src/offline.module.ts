import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';

import { now } from 'moment';

import { AbstractHttpService, App } from '@wm/core';
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
        deviceService.addStartUpService({
            serviceName: 'OfflineStartupService',
            start: () => {
                if (window['cordova'] && window['SQLitePlugin']) {
                    localDBManagementService.setLogSQl((localStorage.getItem('wm.logSql') === 'true'));
                    (window as any).logSql = (flag = true) => {
                        localDBManagementService.setLogSQl(flag);
                        localStorage.setItem('wm.logSql', flag ? 'true' : 'false');
                    };
                    return localDBManagementService.loadDatabases().then(() => {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        new SecurityOfflineBehaviour(app, file, networkService, securityService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                    });
                }
                return Promise.resolve();
            }
        });
    }
}