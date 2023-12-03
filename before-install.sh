#!/bin/bash
ps -ef | grep /usr/bin/node | awk '{print  $2}' | xargs -n 1 sudo kill -9
rm -rf /home/ec2-user/cloud-formation/*
