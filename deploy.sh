#!/bin/bash

sudo cd /home/ec2-user/cloud-formation/nodejs/
sudo npm install && sudo touch /tmp/npminstall && echo pwd > /tmp/pwd
cat /home/ec2-user/db_endpoint | xargs -n 1 -I {}  sudo sed -i  "s/.*host.*/    host: '{}',/" /home/ec2-user/cloud-formation/nodejs/index.js
sudo nohup /usr/bin/node index.js &

