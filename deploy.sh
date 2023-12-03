#!/bin/bash

npm install
npm install -g pm2
ps -ef | grep /usr/bin/node | awk '{print  $2}' | xargs -n 1 sudo kill -9
sudo nohup /usr/local/bin/node index.js &

