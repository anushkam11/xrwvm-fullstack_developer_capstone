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

### Skills Network Code Engine demo

In the lab's **Code Engine CLI** terminal, run the following command to build
the application from the public GitHub repository and deploy it alongside
the other apps in the selected project.

```sh
ibmcloud ce application create --name cars-dealership \
  --build-source https://github.com/anushkam11/xrwvm-fullstack_developer_capstone \
  --build-dockerfile Dockerfile.codeengine --port 8080 \
  --cpu 1 --memory 2G --min-scale 1 --max-scale 1
```

If the lab account cannot create the build registry policy, use the tested
GitHub Actions image from GHCR. For a public package, run:

```sh
ibmcloud ce application create --name cars-dealership \
  --image ghcr.io/anushkam11/cars-dealership-capstone:latest --port 8080 \
  --cpu 1 --memory 2G --min-scale 1 --max-scale 1
```

For a private package, [configure a registry secret](https://cloud.ibm.com/docs/codeengine?topic=codeengine-add-registry)
and add `--registry-secret SECRET_NAME` to the command.
Run `ibmcloud ce application get --name cars-dealership` to retrieve the URL.
This single-instance demo stores SQLite and MongoDB data on the container's
temporary disk. Accounts and reviews reset when the instance is replaced.
