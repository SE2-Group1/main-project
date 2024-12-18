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
   Open the `.env` file and enter the appropriate values for the database environment variables.       
   ```bash
   DB_USER=
   DB_NAME=
   DB_PASSWORD=
   ```
3. **Set Mapbox Environment Variables for the Client**:  
   In the `client` folder, copy the `.env.example` file and rename it to `.env`.

   ```bash
   cp .env.example .env
   ```

   Open the `.env` file and enter the Mapbox token:
   ```bash
   REACT_APP_MAPBOX_TOKEN=
   ```

## Starting the Database

To start the database using Docker, run the following command:

```bash
npm run db
```

This command will use Docker to start the PostgreSQL database and its configurations.

## Starting Client and Server

- **Install all dependencies**

  ```bash
  npm run install-all
  ```

- **To start the client**:

  ```bash
  npm run client
  ```

- **To start the server**:

  ```bash
  npm run server
  ```


## Credits
- Landing page diagram column pic: <a href="https://unsplash.com/it/@driftswift?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Shashidhar S</a> from <a href="https://unsplash.com/it/foto/una-casa-coperta-di-neve-con-una-luna-piena-sullo-sfondo-pZJGkVqhQhM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

- Landing page list column pic: <a href="https://unsplash.com/it/@mietlicha?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Anna Kubiak</a> from <a href="https://unsplash.com/it/foto/silhouette-di-montagna-sotto-aurora-borealis-4OLiKJ48ADY?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

- Landing page map column pic: <a href="https://unsplash.com/it/@davidkhlr?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">David Köhler</a> from <a href="https://unsplash.com/it/foto/unaurora-verde-e-blu-su-una-foresta-innevata-Uqh1XtNYhus?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>

- Document list background <a href="https://unsplash.com/it/@thrstschfr?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Timo Horstschaefer</a> from <a href="https://unsplash.com/it/foto/cielo-verde-e-blu-sopra-il-campo-coperto-di-neve-e-gli-alberi-3QTe0CdhcL4?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      
- Login page pic: <a href="https://unsplash.com/it/@linusmimietz?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Linus Mimietz</a> from <a href="https://unsplash.com/it/foto/persone-alla-strada-tra-gli-edifici-commerciali-QYI__0vehUs?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>
      
      