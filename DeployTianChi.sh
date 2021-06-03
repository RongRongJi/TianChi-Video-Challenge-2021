#!/bin/bash

docker stop frontend
docker stop backend

cd ./video-backend
ls
docker build -t backend .

cd ../video-together
ls
docker build -t frontend .

docker run -p 8080:80 --name frontend --rm -d frontend http-server -p 80 dist
docker run -p 5000:5000 --name backend --rm -d backend