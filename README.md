# 1. PRJ371PyracanthaGroup11
A collection of solutions to help detect and report on invasive speicies like Pyracantha.

# 2. DEPLOYING THE INVASCAN API TO DOCKER
Make sure to run this command on the API base folder where you can see the Dockerfile.

## 1.1 Building the Docker Image
    docker build -t invascanwebapi:v1.6 .
## 1.2 Creating a docker container for the API
    docker run --name invascanapi_container -p 8006:8006 -d -v invascanwebapi:v1.6
    
