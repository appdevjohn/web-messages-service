# Web Messages Service

This is a basic back-end service to support a messaging web app.

## Setting Up

Make sure Node is installed on your machine, then in the project directory, install the dependencies.

```
npm install
```

Then run the project.

```
npm run dev
```

### With Docker

You can run this in a production context with Docker.

```
docker build -t web-messages-service .
docker run -p 8000:8000 web-messages-service
```
