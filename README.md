# AssetIQ — Enterprise IT Asset Intelligence Platform

AssetIQ is a full-stack enterprise IT asset intelligence platform built to demonstrate end-to-end software engineering, data engineering, security analytics, and DevOps workflows.

The platform processes Belarc-style IT asset data and presents asset inventory, software, patching, vulnerability, hardware, and security analytics through a modern enterprise dashboard.

## Architecture

```text
Belarc-style Reports
        ↓
Python ETL / Data Processing
        ↓
MySQL / MariaDB
        ↓
Laravel REST API
        ↓
React Dashboard
        ↓
AssetIQ Enterprise Interface
```

## Technology Stack

### Frontend

- React
- Vite
- JavaScript / JSX
- Axios
- Recharts
- Lucide React
- Nginx

### Backend

- Laravel
- PHP
- Laravel Sanctum
- REST API
- PHPUnit

### Data and AI

- Python
- Pandas
- BeautifulSoup
- SQLite
- Streamlit
- Random Forest / XGBoost
- SHAP
- NLP software categorization
- ChromaDB
- Sentence Transformers
- RAG / LLM experimentation

### Infrastructure

- Docker
- Docker Compose
- MariaDB
- Git
- GitHub
- GitLab

## Dataset

The current generated enterprise-style dataset contains:

- 520 machines
- 8,361 software records
- 5,136 hotfix records
- 1,424 vulnerability records
- 15,441 records across the four primary asset tables

## Features

- Enterprise asset inventory
- Global asset search
- Pagination
- Asset detail views
- Hardware information
- Installed software inventory
- Hotfix and patch information
- Vulnerability tracking
- Security analytics
- Department analytics
- Operating system analytics
- Hardware telemetry
- Laravel Sanctum authentication
- Protected REST API endpoints
- Responsive React enterprise dashboard
- Dockerized frontend, backend, and database
- PHPUnit authentication feature tests

## Repository Structure

```text
AssetIQ/
├── api/                  # Laravel REST API
├── dashboard/            # React/Vite frontend
├── data-ai/              # Python ETL, analytics, ML/NLP/RAG
├── docker/               # Database initialization resources
├── scripts/              # Docker and data utility scripts
├── docker-compose.yml
├── .env.docker.example
├── README_DOCKER.md
└── README.md
```

## Running with Docker

### 1. Create the local Docker environment file

From PowerShell:

```powershell
if (-not (Test-Path .env.docker)) {
    Copy-Item .env.docker.example .env.docker
}
```

Only create `.env.docker` from the example during first-time setup. Do not overwrite an existing configured `.env.docker`.

Configure the required values inside `.env.docker`.

Do not commit `.env.docker` to source control.

### 2. Build and start AssetIQ

```powershell
docker compose --env-file .env.docker up -d --build
```

### 3. Check service health

```powershell
docker compose --env-file .env.docker ps
```

The three services should report as healthy:

```text
assetiq-api-1
assetiq-frontend-1
assetiq-mysql-1
```

### 4. Open the application

```text
Frontend: http://localhost:5173
API:      http://localhost:8000
MariaDB:  localhost:3307
```

## Testing

Run the Laravel feature tests inside Docker:

```powershell
docker compose --env-file .env.docker exec api php artisan test --testsuite=Feature
```

Current authentication testing baseline:

```text
4 tests passed
18 assertions
```

The authentication feature tests cover:

- Successful login
- Invalid credentials
- Protected endpoint authentication
- Logout and session invalidation

## REST API

Asset endpoints include:

```text
GET /api/assets
GET /api/assets/{pc_name}
GET /api/assets/{pc_name}/software
GET /api/assets/{pc_name}/hotfixes
GET /api/assets/{pc_name}/vulnerabilities
```

Analytics endpoints include:

```text
GET /api/analytics/overview
GET /api/analytics/security
GET /api/analytics/hardware
```

Authentication endpoints include:

```text
POST /api/login
GET  /api/user
POST /api/logout
```

Protected application resources use Laravel Sanctum authentication.

## Project Direction

AssetIQ is designed as a portfolio-scale enterprise platform demonstrating:

```text
Data Engineering
        +
Backend / REST APIs
        +
Database Design
        +
Frontend Development
        +
Security Analytics
        +
Machine Learning
        +
NLP / RAG
        +
Docker / DevOps
        +
Automated Testing
```

Future development will integrate more of the existing machine learning, SHAP, NLP, software categorization, and RAG capabilities directly into the full-stack AssetIQ interface.

## Author

**jandicalaea**

BS Computer Engineering graduate building AssetIQ as a portfolio project for software engineering, data engineering, and full-stack development roles.