#!/usr/bin/env bash
# exit on error
set -o errexit

pip install pipenv
pipenv install --deploy

cd src
pipenv run python manage.py collectstatic --no-input
pipenv run python manage.py migrate
