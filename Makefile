DOCKER_COMPOSE = docker compose
DOCKER_TARGET = Docker-compose-dev.yml

.PHONY: all
all: start


.PHONY: build
build:
	./script/setup.sh
	$(DOCKER_COMPOSE) -f $(DOCKER_TARGET) build

.PHONY: start
start: stop build
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
prune: stop
	docker system prune --all --force

.PHONY: prune_full
prune_full: stop
	rm -rf data
	docker system prune --all --force --volumes 
