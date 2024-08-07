# OneTimeChat - Service

This is a basic backend service to support a messaging web app. It has REST API endpoints for certain functions and offers real-time message support with Socket.IO.

This backend service was made to support the web app that was made alongside it. You can find the codebase for that project [here](https://github.com/appdevjohn/web-messages). In addition, this project requires a running PostgreSQL database, the setup of which can be found [here](https://github.com/appdevjohn/web-messages-db).

## Required Environment Variables

| Name       | Description                                | Example     |
| ---------- | ------------------------------------------ | ----------- |
| PGUSER     | The user for the PostgreSQL database.      | user        |
| PGHOST     | The host name for the database.            | localhost   |
| PGDATABASE | The database name.                         | messages_db |
| PGPASSWORD | The password for the user of the database. | password1   |

## Running on your Local Machine

1. Ensure Node.js is installed on your machine.
2. Run `npm install` in this directory to install dependencies.
3. Run `npm run dev` to run in a development environment.

## Running in a Production Environment

1. Ensure Node.js is installed on your machine.
2. Run `npm install` in this directory.
3. Run `npm run build` to build a production application.
4. Run `npm start` to serve the production application.

### Running in Production with Docker

You can run this in a production context in a Docker container.

```
docker build -t messages-service .
docker run -p 8000:8000 --env-file .env web-messages-service
```
