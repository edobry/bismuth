const CloudAtCostApi = require("cloudatcost"),
    Provider = require("."),
    fs = require("fs");

const cacCreds = JSON.parse(fs.readFileSync("/Users/Gingy/.cloudatcost"));

module.exports = class CloudAtCost extends Provider {
    constructor() {
        super("Cloud@Cost");

        this.api = new CloudAtCostApi(cacCreds.key, cacCreds.email);
    }
    activeInstances(cb) {
        this.api.listServers(cb);
    }
    availableResources(cb) {
        this.api.pro_resources(cb);
    }
};
