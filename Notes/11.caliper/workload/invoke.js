'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.txIndex = 7000000;
        this.colors = ["Red","Blue","Green","Black"]
        this.size=["10","20","30"]
        this.appraisedValue=["10000","15000","20000"]
        this.owner=["Joe","Ray","Kavin","Ben"]
    }

    /**
    * Initialize the workload module with the given parameters.
    * @param {number} workerIndex The 0-based index of the worker instantiating the workload module.
    * @param {number} totalWorkers The total number of workers participating in the round.
    * @param {number} roundIndex The 0-based index of the currently executing round.
    * @param {Object} roundArguments The user-provided arguments for the round from the benchmark configuration file.
    * @param {ConnectorBase} sutAdapter The adapter of the underlying SUT.
    * @param {Object} sutContext The custom context object provided by the SUT adapter.
    * @async
    */
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        this.workerIndex=workerIndex;
        this.totalWorkers=totalWorkers;
        this.roundIndex=roundIndex;
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
    }
    async submitTransaction() {
        this.txIndex++;
        const assetID = (((this.txIndex+this.workerIndex+this.roundIndex % 10) + 99) * 10)

        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: this.roundArguments.contractFunction,
            contractArguments: [assetID, this.getValues(this.colors), this.getValues(this.size), this.getValues(this.owner), this.getValues(this.appraisedValue)],
            readOnly: false
        };
        await this.sutAdapter.sendRequests(request);
    }

    getValues(array) {
        return array[Math.floor(Math.random()*array.length)];
    }

}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
