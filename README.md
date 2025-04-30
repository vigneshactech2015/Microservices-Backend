docker container prune  --> Remove all container
docker-compose down -v 
docker-compose up --build (Docker file Changes)
docker-compose up (Restart Service for Code changes)



CONSUL : http://localhost:8500/
API Gateway : http://localhost:3000/api/serviceName/path
RabbitMQ (Decoupled Async Messaging queqe) : http://localhost:15672


Service Discovery : CONSUL
Backend and API Gateway: Node JS + Express JS
Container Orchestration : Docker Compose


MICROSERVICES:

API Gateway : PORT 3000
Auth Service : PORT 3001
Product Service : PORT 3002
Cart Service : PORT 3003
Order Service : PORT 3004
Notification Service : PORT 3005
Inventory Service : PORT 3006

Order Service has RabbitMQ Connection

