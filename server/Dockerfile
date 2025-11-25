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
CMD python manage.py migrate && \
    python manage.py shell -c "from companion.models import User; print('✓ Admin user already exists' if User.objects.filter(username='admin').exists() else 'Creating admin user...'); User.objects.filter(username='admin').exists() or (User.objects.create_superuser('admin', 'admin@admin.com', 'admin', full_name='Admin User'), print('✓ Admin user created successfully'))[1]" && \
    gunicorn mindvoice_project.wsgi:application --bind 0.0.0.0:$PORT --timeout 300
