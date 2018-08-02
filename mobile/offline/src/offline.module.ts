import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { File } from '@ionic-native/file';
import { SQLite } from '@ionic-native/sqlite';

import { now } from 'moment';

import { AbstractHttpService } from '@wm/core';
import { DeviceFileService, DeviceFileUploadService, DeviceService, NetworkService } from '@wm/mobile/core';

import { ChangeLogService, PushService } from './services/change-log.service';
import { LocalDBManagementService } from './services/local-db-management.service';
import { LocalKeyValueService } from './services/local-key-value.service';
import { LocalDbService } from './services/local-db.service';
import { FileHandler, UploadedFilesImportAndExportService } from './services/workers/file-handler';
import { ErrorBlocker } from './services/workers/error-blocker';
import { IdResolver } from './services/workers/id-resolver';
import { MultiPartParamTransformer } from './services/workers/multi-part-param-transformer';
import { PushServiceImpl } from './services/push.service';
import { LiveVariableOfflineBehaviour } from './utils/live-variable.utils';
import { FileUploadOfflineBehaviour } from './utils/file-upload.utils';
import { NamedQueryExecutionOfflineBehaviour } from './utils/query-executor.utils';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [],
    exports: [],
    providers: [
        ChangeLogService,
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
        changeLogService: ChangeLogService,
        deviceService: DeviceService,
        deviceFileService: DeviceFileService,
        deviceFileUploadService: DeviceFileUploadService,
        file: File,
        httpService: AbstractHttpService,
        localDBManagementService: LocalDBManagementService,
        localDbService: LocalDbService,
        networkService: NetworkService
    ) {
        if (window['cordova'] && window['SQLitePlugin']) {
            deviceService.addStartUpService({
                serviceName: 'OfflineStartupService',
                start: () => {
                    return localDBManagementService.loadDatabases().then(() => {
                        changeLogService.addWorker(new IdResolver(localDBManagementService));
                        changeLogService.addWorker(new ErrorBlocker(localDBManagementService));
                        changeLogService.addWorker(new FileHandler());
                        changeLogService.addWorker(new MultiPartParamTransformer(deviceFileService, localDBManagementService));
                        new LiveVariableOfflineBehaviour(changeLogService, localDBManagementService, networkService, localDbService).add();
                        new FileUploadOfflineBehaviour(changeLogService, deviceFileService, deviceFileUploadService, file, networkService, deviceFileService.getUploadDirectory()).add();
                        new NamedQueryExecutionOfflineBehaviour(changeLogService, httpService, localDBManagementService, networkService).add();
                        localDBManagementService.registerCallback(new UploadedFilesImportAndExportService(changeLogService, deviceFileService, localDBManagementService, file));
                        this.logSql(localDBManagementService);
                    });
                }
            });
            (window as any).logSql = (flag = true) => {
                localStorage.setItem('logSql', flag ? 'true' : 'false');
            };
        }
    }



    private logSql(localDBManagementService: LocalDBManagementService) {
        const logger = console;
        localDBManagementService.loadDatabases().then( databases => {
            databases.forEach(db => {
                const sqliteObject = db.sqliteObject,
                    originalExecuteSql = db.sqliteObject.executeSql;
                sqliteObject.originalExecuteSql = (sql, params) => {
                    const startTime = now();
                    return originalExecuteSql.call(sqliteObject, sql, params).then(result => {
                        if (localStorage.getItem('logSql') === 'true') {
                            const objArr = [],
                                rowCount = result.rows.length;
                            for (let i = 0; i < rowCount; i++) {
                                objArr.push(result.rows.item(i));
                            }
                            logger.debug('SQL "%s"  with params %O took [%d ms]. And the result is %O', sql, params, Date.now() - startTime, objArr);
                        }
                        return result;
                    }, error => {
                        logger.error('SQL "%s" with params %O failed with error message %s', sql, params, error.message);
                        return Promise.reject(error);
                    });
                };
            });
        });
    }
}