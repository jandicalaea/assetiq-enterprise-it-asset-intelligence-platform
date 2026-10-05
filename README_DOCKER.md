# AssetIQ Docker Development Stack

This folder orchestrates the existing AssetIQ projects without merging the repositories.

Expected Windows layout:

```text
D:\Projects\
├── belarc-api\
├── belarc-dashboard\
└── AssetIQ-Docker\
    ├── docker-compose.yml
    ├── .env.docker
    ├── docker\mysql\init\
    └── scripts\
```

The stack runs:

```text
Browser
  ↓ http://localhost:5173
Nginx + React production build
  ↓ http://localhost:8000
Laravel 13 / Sanctum API
  ↓ mysql:3306 (Docker network)
MariaDB 10.11
```

Host ports:

- React: `http://localhost:5173`
- Laravel: `http://localhost:8000`
- MariaDB: `127.0.0.1:3307` (intentionally not 3306, so it does not collide with XAMPP MySQL)

## 1. Apply the two project patches

The backend project needs the Dockerfile, entrypoint, `.dockerignore`, and restored Laravel migrations/factory.
The frontend project needs the Dockerfile, Nginx SPA configuration, and `.dockerignore`.

Apply the supplied backend patch to `D:\Projects\belarc-api` and the frontend patch to `D:\Projects\belarc-dashboard`.

## 2. Install Docker Desktop

Docker Desktop must be installed and running. On Windows, use the WSL 2 backend when Docker Desktop recommends it.

Verify in PowerShell:

```powershell
docker --version
docker compose version
```

## 3. Create Docker environment values

From `D:\Projects\AssetIQ-Docker`:

```powershell
Copy-Item .env.docker.example .env.docker
code .env.docker
```

Change all three `change_this_...` values before starting the stack.

`ASSETIQ_ADMIN_PASSWORD` becomes the password used by the Dockerized AssetIQ admin account. The seeder uses `updateOrCreate`, so it is safe to run on later starts.

## 4. Export the real AssetIQ database

This is the recommended step because the application currently has real asset data in the local XAMPP/MariaDB database.

Start XAMPP MySQL, then from `D:\Projects\AssetIQ-Docker` run:

```powershell
.\scripts\export-database.ps1
```

The script writes:

```text
D:\Projects\AssetIQ-Docker\docker\mysql\init\01-assetiq-data.sql
```

The SQL file is ignored by Git so real dataset contents are not accidentally committed.

After the export succeeds, XAMPP MySQL can be stopped. Docker's MariaDB uses host port `3307`, so it can also coexist with XAMPP if needed.

### Important

MariaDB imports files in `docker/mysql/init` only when its Docker volume is created for the first time.
If you start the stack before creating the SQL dump, the Laravel migrations still create a valid empty schema, but the 520-asset dataset will not be present.

To intentionally re-import the SQL dump later:

```powershell
.\scripts\reset-docker.ps1
```

This deletes the Docker database volume and therefore deletes Docker-only database changes before the next import.

## 5. Build and start AssetIQ

From `D:\Projects\AssetIQ-Docker`:

```powershell
docker compose --env-file .env.docker up --build -d
```

Watch startup:

```powershell
docker compose --env-file .env.docker ps
docker compose --env-file .env.docker logs -f api
```

On first build, Docker downloads the base images and installs Composer/NPM dependencies, so it takes longer than later starts.

## 6. Open AssetIQ

Open:

```text
http://localhost:5173
```

Sign in with the email/password from `.env.docker`:

```text
ASSETIQ_ADMIN_EMAIL
ASSETIQ_ADMIN_PASSWORD
```

Laravel health endpoint:

```text
http://localhost:8000/up
```

## 7. Useful Docker commands

Start existing containers:

```powershell
docker compose --env-file .env.docker up -d
```

Stop containers without deleting data:

```powershell
docker compose --env-file .env.docker down
```

Rebuild after Dockerfile/dependency changes:

```powershell
docker compose --env-file .env.docker up --build -d
```

View all logs:

```powershell
docker compose --env-file .env.docker logs -f
```

View API logs:

```powershell
docker compose --env-file .env.docker logs -f api
```

Open a Laravel shell inside the API container:

```powershell
docker compose --env-file .env.docker exec api php artisan tinker
```

Run migrations manually:

```powershell
docker compose --env-file .env.docker exec api php artisan migrate
```

Run frontend build validation inside a temporary Node container:

```powershell
docker compose --env-file .env.docker build frontend
```

## Data and persistence

MariaDB data is stored in the named Docker volume:

```text
assetiq_assetiq_mysql_data
```

`docker compose down` keeps this volume.
`docker compose down -v` deletes it.

The backend container automatically:

1. waits for MariaDB,
2. generates a Laravel application key inside the container when required,
3. runs pending migrations,
4. ensures the configured local admin user exists,
5. starts Laravel on port 8000.

No fake asset records are created by the Docker setup.
