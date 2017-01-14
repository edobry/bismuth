const meta = require("./package.json"),
    CloudAtCost = require("./providers/cloudAtCost");

console.log(`${meta.name} v${meta.version}`);
console.log(`${meta.description}\n`);

console.log("Loading providers...");
const providers = {
    cloudAtCost: new CloudAtCost()
};
console.log(`Available providers: ${Object.keys(providers).join(', ')}`);

//kind of redundant, but lets, for formalitys sake
var mainProvider = providers.cloudAtCost;
console.log(`Main provider set as ${mainProvider.name}\n`);

/*
    ok so what do we want to manage...

    instances
        traditional servers

    applications
        apps are housed on an instance, or on compute mesh when implemented

    networking
        should be able to assign subdomains and ports from same UI

    devices
        user terminals, effectively. grouped with instances or nah?
        probably should be, as apps can be run on these. mb server instances
        should be subset of devices...

    syncthing graph
        should be managed as app, ie running on devices,
        but also as storage service?

    ok, good for now. lets start with instances. how to handle clouds, aka providers?
    don't need to solve yet. for now, all instances are from c@c.

*/

//first: lets get all currently-running c@c servers.

console.log("Querying active instances...");
mainProvider.activeInstances((err, { data: servers }) => {
    console.log(`Active instances: ${servers.map(({ label }) => label).join(', ')}\n`);

    console.log("Querying available resources...");
    mainProvider.availableResources((err, { data: { total, used } }) => {
        const available = Object.entries(total)
            .map(([totalName, totalValue]) => {
                const name = totalName.replace(/_total/, "");
                return [name, totalValue - used[`${name}_used`]];
            })
            .reduce((map, [name, value]) => {
                map[name] = value;
                return map;
            }, {});

        console.log("Available resources:");
        console.log(Object.entries(available)
            .map(([name, value]) => `${name}: ${value}`).join('\n'));

        console.log("\nyou're welcome.")
    });
});
