const
    { sh, install, restart, start, writeConfig, getRoot, switchUser, gitClone }
        = require("../../helpers/util"),
    docker = require("../../helpers/docker");

const deps = [
    "prometheus",
    "prometheus-node-exporter",
    "prometheus-pushgateway",
    "prometheus-alertmanager"];

const volumeName = "prometheus-storage";

const configPath = "/etc/prometheus/prometheus.yml";

console.log(sh`
    ${docker.createVolume(volumeName)}

    docker run -p 9090:9090 \
        --mount type=bind,source=${configPath},target=${configPath} \
        --mount type=volume,source=$(volumeName),target=/prometheus \
        --restart=always
        --name prometheus
        prom/prometheus
`);
