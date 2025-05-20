# 1. PRJ371PyracanthaGroup11
A collection of solutions to help detect and report on invasive speicies like Pyracantha.

# 2. DEPLOYING THE INVASCAN API TO DOCKER
Make sure to run this command on the API base folder where you can see the Dockerfile.

## 2.1 Building the Docker Image
    docker build -t invascanwebapi:v1.6 .
## 2.2 Creating a docker container for the API
    docker run --name invascanapi_container -p 8006:8006 -d invascanwebapi:v1.6
## 2.3 Access the AI Engine API 
    http://127.0.0.1:8006/docs#/default

# 3. SETTING UP MICROSOFT SQL SERVER(DOCKER CONTAINER)
The following section is a guide to setup Microsoft SQL Server lastest version to run as a container on Docker.
## 3.1 Pulling MSSQL Docker Images
    docker pull mcr.microsoft.com/mssql/server

## 3.2 Creating the docker container.
    docker run --restart always -e ‘ACCEPT_EULA=Y’ -e "SA_PASSWORD=PRJ371Grp11" --name mssql_container -p 1404:1433 -d mcr.microsoft.com/mssql/server

    
