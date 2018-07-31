import { Change, FlushContext, Worker } from '../change-log.service';

declare const _;

const STORE_KEY = 'offlineFileUpload';

export class FileHandler implements Worker {

    private fileStore;

    public preflush(context: FlushContext) {
        this.fileStore = context.get(STORE_KEY);
    }

    /**
     * Replaces all local paths with the remote path using mappings created during 'uploadToServer'.
     */
    public preCall(change: Change) {
        if (change.service === 'DatabaseService') {
            change.params.data = _.mapValues(change.params.data, function (v) {
                const remoteUrl = this.fileStore[v];
                if (remoteUrl) {
                    console.debug('swapped file path from %s -> %s', v, remoteUrl);
                    return remoteUrl;
                }
                return v;
            });
        }
    }

    public postCallSuccess(change: Change, response: any) {
        if (change.service === 'OfflineFileUploadService'
            && change.operation === 'uploadToServer') {
            /*
             * A mapping will be created between local path and remote path.
             * This will be used to resolve local paths in entities.
             */
            this.fileStore[change.params.file]             = response[0].path;
            this.fileStore[change.params.file + '?inline'] = response[0].inlinePath;
        }
    }

}