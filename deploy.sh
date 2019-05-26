# Builds our Docker images with multiple tags
docker build -t sxa011/multi-client:latest -t sxa011/multi-client:$SHA -f ./client/Dockerfile ./client
docker build -t sxa011/multi-server:latest -t sxa011/multi-server:$SHA -f ./server/Dockerfile ./server
docker build -t sxa011/multi-worker:latest -t sxa011/multi-worker:$SHA -f ./worker/Dockerfile ./worker

# Push images to Docker Hub
docker push sxa011/multi-client:latest
docker push sxa011/multi-server:latest
docker push sxa011/multi-worker:latest
docker push sxa011/multi-client:$SHA
docker push sxa011/multi-server:$SHA
docker push sxa011/multi-worker:$SHA

# Apply all configs in the k8s directory
# Remember, Google Cloud CLI already provides kubectl in Travis
kubectl apply -f k8s

# Imperatively set the latest image in each deployment
kubectl set image deployments/client-deployment client=sxa011/multi-client:$SHA
kubectl set image deployments/server-deployment server=sxa011/multi-server:$SHA
kubectl set image deployments/worker-deployment worker=sxa011/multi-worker:$SHA