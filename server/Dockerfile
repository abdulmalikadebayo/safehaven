FROM python:3.12-slim

WORKDIR /app

# Install pipenv
RUN pip install pipenv

# Copy dependencies
COPY Pipfile Pipfile.lock ./
RUN pipenv install --system --deploy

# Copy everything
COPY . .

WORKDIR /app/src

# Run app
CMD python manage.py migrate && gunicorn mindvoice_project.wsgi:application --bind 0.0.0.0:$PORT
