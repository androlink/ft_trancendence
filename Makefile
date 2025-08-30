DOCKER_COMPOSE = docker-compose
DOCKER_TARGET = Docker-compose.yml

.PHONY: all
all: start


.PHONY: build
build:
	mkdir -p secrets
	./script/ssl_setup.sh
	$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) build

.PHONY: start
start: build
	$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) up -d

.PHONY: restart
restart:
	$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) restart

.PHONY: ps
ps:
	-$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) ps

.PHONY: stop
stop:
	$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) down

.PHONY: log
log:
	-$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) logs -f

.PHONY: rm
rm: stop
	$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) rm

.PHONY: prune
prune:
	docker system prune --all --force