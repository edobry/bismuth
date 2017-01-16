const
    Promise = require("bluebird"),
    CloudAtCostApi = require("cloudatcost"),
    Provider = require("."),
    fs = require("fs");

const cacCreds = JSON.parse(fs.readFileSync("/Users/Gingy/.cloudatcost"));

module.exports = class CloudAtCost extends Provider {
    constructor() {
        super("Cloud@Cost");

        this.api = Promise.promisifyAll(new CloudAtCostApi(cacCreds.key, cacCreds.email), {
            suffix: 'P'
        });
    }
    activeInstances() {
        return this.api.listServersP();
    }
    availableResources() {
        return this.api.pro_resourcesP();
    }
};
