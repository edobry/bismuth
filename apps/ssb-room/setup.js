const
    {
        sh, install, restart, start, writeConfig, getRoot, createUser,
        switchUser, gitClone, makeExecutable
    } = require("../../helpers/util"),
    { runHourly } = require("../helpers/cron"),
    dockerSetup = require("../docker/setup"),
    harden = require("../../helpers/harden.js");

const deps = [
    "apt-transport-https",
    "ca-certificates",
    "curl",
    "software-properties-common"];

const roomDir = "~/ssb-room-data";

/*
    figure out file copying approach
    one possibility is to open a parallel sftp connection
    lookup: possible to multiplex shell and sftp over single ssh?
*/

const createRoom = "createRoom.sh";
const room = "room.sh";
const startRoom = "startRoom.cron";
const startHealer = "startHealer.cron";

console.log(sh`
    ${harden}
    ${dockerSetup}

    docker pull staltz/ssb-room
    mkdir ${roomDir}
    chown -R 1000:1000 ${roomDir}
    sudo iptables -t nat -A PREROUTING -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 8007

    ${writeConfig(createRoom)}
    ${makeExecutable(createRoom)}
    ./${createRoom}

    ${writeConfig(room)}
    ${makeExecutable(room}
    ./${room} check

    #set up healing
    docker pull ahdinosaur/healer
    docker run -d --name healer \
        -v /var/run/docker.sock:/tmp/docker.sock \
        --restart unless-stopped \
        ahdinosaur/healer

    #set up cron

    ${writeConfig(startRoom)}
    ${runHourly(startRoom)}

    #copy ${startHealer}
    ${runHourly(startHealer)}
`);
