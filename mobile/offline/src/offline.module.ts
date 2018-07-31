import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SQLite } from '@ionic-native/sqlite';

import { DeviceFileService, DeviceService } from '@wm/mobile/core';

import { ChangeLogService, PushService } from './services/change-log.service';
import { LocalDBManagementService } from './services/local-db-management.service';
import { LocalKeyValueService } from './services/local-key-value.service';
import { LocalDbService } from './services/local-db.service';
import { FileHandler } from './services/workers/file-handler';
import { ErrorBlocker } from './services/workers/error-blocker';
import { IdResolver } from './services/workers/id-resolver';
import { MultiPartParamTransformer } from './services/workers/multi-part-param-transformer';
import { PushServiceImpl } from './services/push.service';

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
        localDBManagementService: LocalDBManagementService,
        localDbService: LocalDbService
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
                    });
                }
            });
        }
    }
}