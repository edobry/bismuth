cd apps
git clone git@github.com:KinToday/kin-web-client.git
cd kin-web-client

npm install
NODE_ENV=prod gulp webpack
