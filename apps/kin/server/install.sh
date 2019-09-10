cd ../../
git clone https://github.com/KinToday/kin-api-server.git
cd kin-api-server

#get deps and build
npm install
NODE_ENV=prod gulp servers

#run it
NODE_ENV=prod gulp pm
pm2 start pm.json

mucks-register --path api --app "kin-api" --port 8080
