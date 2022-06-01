imageName="vdocker/node:v1"
containerName="vcorpus"

echo "Stop & Remove $containerName"
docker stop $containerName 2> /dev/null || true
docker rm $containerName 2> /dev/null || true
echo "Build $imageName"
docker build -t $imageName -f Dockerfile .
docker image prune --filter="dangling=true" --force
echo "Run $containerName"
docker run --name $containerName -p 80:8081 -d $imageName
docker ps
