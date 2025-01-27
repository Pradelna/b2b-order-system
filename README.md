# washservice

## Content

- [Start](#start)

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
```sh
python manage.py migrate
python manage.py makemigrations accounts
python manage.py makemigrations customer
python manage.py makemigrations place
python manage.py makemigrations order
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
npm install vite --save-dev
npm install
```

Run react app server
```sh
npm run dev
```