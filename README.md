# Cars Dealership - Full Stack Development Capstone

A full-stack web application for browsing car dealerships,
filtering dealerships by state, and submitting customer reviews.

## Technologies
React, Django, Python, Node.js, MongoDB, SQLite, Flask,
Docker, Kubernetes and IBM Cloud Code Engine.

## Run locally

Run `docker compose up --build`, then open <http://localhost:8000>.
The app seeds dealership and review fixtures in MongoDB and the vehicle catalog
in SQLite. Create a local admin account with
`docker compose exec django python manage.py createsuperuser`.

For deployment, build the Django, dealership API and sentiment images using the
Dockerfiles in this repository. Configure `backend_url`, `sentiment_analyzer_url`,
`DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, and `DJANGO_DEBUG=0` for the Django
service. Keep the service URLs and MongoDB connection private. Mount persistent
storage for SQLite and MongoDB. Django listens on `PORT` (8000 by default).
