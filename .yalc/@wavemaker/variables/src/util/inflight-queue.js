var InflightQueue = /** @class */ (function () {
    function InflightQueue() {
        this.requestsQueue = new Map();
    }
    /**
     * pushes the process against a variable in its queue
     * @param variable
     * @param {{resolve: (value?: any) => void; reject: (reason?: any) => void}} param2
     * the resolve callback will be called on
     */
    InflightQueue.prototype.addToQueue = function (variable, param2) {
        if (this.requestsQueue.has(variable)) {
            this.requestsQueue.get(variable).push(param2);
        }
        else {
            var processes = [];
            processes.push({ resolve: param2.resolve, reject: param2.reject, active: false });
            this.requestsQueue.set(variable, processes);
        }
    };
    /**
     * Calls the reject method against the passed process
     * @param process
     */
    InflightQueue.prototype.rejectProcess = function (process) {
        process.reject('PROCESS_REJECTED_IN_QUEUE');
    };
    /**
     * clears the queue against a variable
     * @param variable
     */
    InflightQueue.prototype.clear = function (variable) {
        this.requestsQueue.delete(variable);
    };
    /**
     * executes the n/w calls for a specified variable pushed in its respective queue (pushed while it was inFlight)
     * @param variable
     */
    InflightQueue.prototype.process = function (variable) {
        var processes = this.requestsQueue.get(variable);
        var nextProcess;
        // process request queue for the variable only if it is not empty
        if (!processes || !processes.length) {
            this.clear(variable);
            return;
        }
        // If only one item in queue
        if (processes.length === 1) {
            nextProcess = processes[0];
            if (nextProcess.active) {
                this.clear(variable);
            }
            else {
                nextProcess.active = true;
                nextProcess.resolve();
            }
            return;
        }
        switch (variable.inFlightBehavior) {
            case 'executeLast':
                for (var i = 0; i < processes.length - 2; i++) {
                    this.rejectProcess(processes[i]);
                }
                processes.splice(0, processes.length - 1);
                this.process(variable);
                break;
            case 'executeAll':
                nextProcess = processes.splice(0, 1)[0];
                if (nextProcess.active) {
                    nextProcess = processes.splice(0, 1)[0];
                }
                nextProcess.active = true;
                nextProcess.resolve();
                break;
            default:
                for (var i = 0; i < processes.length - 1; i++) {
                    this.rejectProcess(processes[i]);
                }
                this.clear(variable);
                break;
        }
    };
    /**
     * initializes the queue against a variable and makes the first process call
     * If already initialized and a process in queue is in progress, the queue is not processed.
     * To process the next item in the queue, the process method has to be called from the caller.
     * @param variable
     * @returns {Promise<any>}
     */
    InflightQueue.prototype.submit = function (variable) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.addToQueue(variable, { resolve: resolve, reject: reject });
            if (_this.requestsQueue.get(variable).length === 1) {
                _this.process(variable);
            }
        });
    };
    return InflightQueue;
}());
export var $queue = new InflightQueue();
//# sourceMappingURL=inflight-queue.js.map