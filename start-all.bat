@echo off
cd apna-ghar-microservices\api-gateway && start node index.js
cd ..\auth-service && start node index.js
cd ..\property-service && start node index.js
cd ..\map-service && start node index.js
cd ..\media-service && start node index.js
cd ..\compare-service && start node index.js
cd ..\..
start npm run dev
