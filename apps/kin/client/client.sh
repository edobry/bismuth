cd apps
git clone https://github.com/KinToday/kin-web-client.git
cd kin-web-client

npm install
NODE_ENV=prod gulp webpack
phile --route app --dir public/
