cd ../../
git clone git@github.com:KinToday/kin-api-server.git
cd kin-api-server

#get deps and build
npm install
NODE_ENV=prod gulp servers

#run it
NODE_ENV=prod gulp pm
pm2 start pm.json
