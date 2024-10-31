# SE2 Main Project

## Prerequisites

Ensure that you have the following tools installed:

- [Node.js](https://nodejs.org/) (includes npm)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Environment Configuration

Before running the project, you need to configure the `.env` file for the database environment variables. Follow these steps:

1. **Copy the `.env.example` file**:
   In the root of your project, copy the `.env.example` file and rename it to `.env`.

   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file**:
   Open the `.env` file and enter the appropriate values for the database environment variables, such as `DB_USER`, `DB_PASSWORD`, `DB_NAME`, etc.

## Starting the Database

To start the database using Docker, run the following command:

```bash
npm run db
```

This command will use Docker to start the PostgreSQL database and its configurations.

## Starting  Client and Server

- **To start the client**:

  ```bash
  npm run client
  ```

- **To start the server**:

  ```bash
  npm run server
  ```
