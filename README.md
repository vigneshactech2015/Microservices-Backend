docker container prune  --> Remove all container
docker-compose down -v 
docker-compose up --build



Scaling + Running 

docker-compose up --scale product-service=3 --build

Adding Load balancer to product service since it has more traffic than rest of the service


CONSUL : http://localhost:8500/
API Gateway : http://localhost:3000/api/serviceName/path
RabbitMQ (Decoupled Async Messaging queqe) : http://localhost:15672


Service Discovery : CONSUL
Backend and API Gateway: Node JS + Express JS
Container Orchestration : Docker Compose
Load Balancer : CONSUL


MICROSERVICES:

API Gateway : PORT 3000
Auth Service : PORT 3001
Product Service : PORT 3002
Cart Service : PORT 3003
Order Service : PORT 3004
Notification Service : PORT 3005
Inventory Service : PORT 3006

Order Service has RabbitMQ Connection


DOCKER IMAGES : 

1) API GATEWAY : vigneshactech2015/api-gateway
2) AUTH SERVICE : vigneshactech2015/auth-service
3) PRODUCT SERVICE : vigneshactech2015/product-service
4) CART SERVICE :  vigneshactech2015/cart-service
5) ORDER SERVICE : vigneshactech2015/order-service
6) NOTIFICATION SERVICE : vigneshactech2015/notification-service
7) INVENTORY SERVICE : vigneshactech2015/inventory-service


