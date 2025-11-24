export PIPENV_VERBOSITY=-1
OS := $(shell uname -s 2>/dev/null || echo not)

.PHONY: setup
setup:
	pipenv install
	make migrate
	make superuser
	
.PHONY: run
run:
	pipenv run python src/manage.py runserver 0.0.0.0:8001

.PHONY: shell
shell:
	pipenv run python src/manage.py shell

.PHONY: generate-secret-key
generate-secret-key:
	@pipenv run python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

.PHONY: superuser
superuser:
	DJANGO_SUPERUSER_PASSWORD=admin pipenv run python src/manage.py createsuperuser --no-input \
		--username admin \
		--email admin@admin.com

.PHONY: migrate
migrate: 
	pipenv run python src/manage.py makemigrations
	pipenv run python src/manage.py migrate

.PHONY: makemigrations
makemigrations:
	pipenv run python src/manage.py makemigrations

.PHONY: clean
clean:
	rm -rf ./src/db.sqlite3
	rm -rf ./src/__pycache__
	rm -rf ./src/mindvoice_project/__pycache__
	find ./src -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true

.PHONY: collectstatic
collectstatic:
	pipenv run python src/manage.py collectstatic --no-input

.PHONY: tidy
tidy:
	pipenv run autoflake --in-place --remove-all-unused-imports -r --exclude migrations ./src
	pipenv run isort --atomic ./src/
	pipenv run black ./src/ --exclude=migrations

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make setup              - Install deps, migrate, create superuser"
	@echo "  make run                - Run development server"
	@echo "  make shell              - Django shell"
	@echo "  make generate-secret-key - Generate SECRET_KEY"
	@echo "  make superuser          - Create admin user"
	@echo "  make migrate            - Run migrations"
	@echo "  make makemigrations     - Create migrations"
	@echo "  make clean              - Remove cache files"
	@echo "  make tidy               - Format code"

.DEFAULT_GOAL := help
