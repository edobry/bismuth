module.exports = class Provider {
    constructor(name) {
        this.name = name;
    }
    activeInstances() {
        return Promise.reject(new Error(
            `Provider ${this.name} does not support activeInstances!`));
    }
    availableResources() {
        return Promise.reject(new Error(
            `Provider ${this.name} does not support availableResources!`));
    }
};
