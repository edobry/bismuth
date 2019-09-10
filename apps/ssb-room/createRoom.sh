#!/bin/bash
memory_limit=$(($(free -b --si | awk '/Mem\:/ { print $2 }') - 200*(10**6)))

sudo docker run -d --name room \
   -v ~/ssb-room-data/:/home/node/.ssb/ \
   --network host \
   --restart unless-stopped \
   --memory $memory_limit \
   staltz/ssb-room
