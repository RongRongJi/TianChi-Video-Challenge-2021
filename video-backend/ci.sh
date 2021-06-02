echo replace string 
server_address='10.214.199.195'
dataset_location='/home/huwei/pj-research-datasets/'
sed -i "s|10.214.199.195|${server_address}|" ./src/config.js
sed -i "s|/home/huwei/pj-research-datasets/|${dataset_location}|" ./src/config.js

echo Notice: we will not run npm install
# npm install
echo npm build
npm run build
echo run node app
export NODE_ENV=production
export PM2_HOME="/home/huwei/.pm2"
echo NODE_ENV: $NODE_ENV
echo PM2_HOME: $PM2_HOME
pm2 reload pj-research-backend
echo running...
exit 0

