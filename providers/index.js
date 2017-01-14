module.exports = class Provider {
    constructor(name) {
        this.name = name;
    }
    activeInstances(cb) {
        throw new Error(`Provider ${this.name} does not support activeInstances!`);
    }
    availableResources(cb) {
        throw new Error(`Provider ${this.name} does not support availableResources!`);
    }
};
