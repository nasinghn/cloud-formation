#!/bin/bash
sudo npm install --prefix ./nodejs/
cat /home/ec2-user/db_endpoint | xargs -n 1 -I {}  sudo sed -i  "s/.*host.*/    host: '{}',/" /home/ec2-user/cloud-formation/nodejs/index.js
sudo nohup /usr/bin/node ./nodejs/index.js &
