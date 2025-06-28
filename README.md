# washservice

## Content

- [Project Overview](#project-overview)
- [Start](#start)

# 🧺 <a id="project-overview">Project Overview</a>

This project is a web-based platform developed for a laundry service, aimed at managing customer orders, delivery logistics, invoicing, and status tracking. It also transmits order data to an external service via API for efficient courier management. Built with a Django REST Framework backend and a modern React + TypeScript frontend (via Vite), the system supports both administrators and clients with role-based access control.

### 🚀 Key Features
- Clients can place and track orders through a responsive web interface.
- Orders are automatically duplicated for multiple days using background Celery tasks.
- Real-time integration with a third-party API for courier management.
- Regular status synchronization and photo reporting.
- Admin panel for managing users, couriers, invoices, and order flows.
- Role-based access control for clients and admins.
- Dockerized environment for easy deployment and isolation.
- Continuous integration and delivery via GitHub Actions.
- Background processing with Celery and Redis.
- MinIO for file and photo storage.
- Secure and production-ready with SSL, DNS configuration, and automated maintenance scripts.

## <a id="start">Start</a>
To run the application, download the project files.

If you have [Docker](https://docker.com/):
Open the terminal from the project's root directory, and enter the command:

```sh
$ docker-compose up -d --build
```

If you don't have Docker:
install interpretation for [Python](https://www.python.org/downloads/release/python-3110/) v3.11

install venv

```sh
pip install virtualenv
```
```sh
python3 -m venv venv
```

Change the directory
```sh
cd washpr
```
Install requirements
```sh
pip install -r requirements.txt
```

Create tables
First for user
```sh
python manage.py makemigrations accounts
python manage.py migrate
```
Second for others
```sh
python manage.py makemigrations customer place order
python manage.py migrate
```

Run server
```sh
python manage.py runserver
```

Use another terminal
Change the directory
```sh
cd frontend
```

```sh
npm install
```

Run react app server
```sh
npm run dev
```