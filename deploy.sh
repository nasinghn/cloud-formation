#!/bin/bash

cd /home/ec2-user/cloud-fromation/nodejs/
npm install
npm install -g pm2
cat /home/ec2-user/db_endpoint | xargs -n 1 -I {}  sudo sed -i  "s/.*host.*/    host: '{}',/" /home/ec2-user/cloud-formation/nodejs/index.js
sudo nohup /usr/local/bin/node index.js &

