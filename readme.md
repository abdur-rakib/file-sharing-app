# File Sharing Application

A modern and secure file sharing application built with NestJS backend, featuring Docker containerization, SQLite database, and automated file cleanup.

## Project Structure

```
file-sharing-app/
├── codes/
│   └── backend/         # NestJS backend application
│       ├── src/
│       │   ├── modules/    # Feature modules
│       │   ├── common/     # Shared utilities, interfaces
│       │   ├── config/     # Configuration
│       │   ├── database/   # Database service
│       │   ├── filters/    # Exception filters
│       │   ├── interceptors/ # Response interceptors
│       │   └── middlewares/ # Custom middlewares
│       └── test/       # Test files
├── docker/             # Docker configuration files
└── README.md
```

## Prerequisites

- Node.js (v23+)
- Docker (latest stable version)
- Docker Compose (v2.0+)
- Git

## Features

### Backend (NestJS)

- File Management

  - Local/Cloud storage support
  - Automated cleanup of inactive files
  - File metadata tracking
  - Configurable cleanup schedule
  - Public/Private key system

- Security & Rate Limiting

  - IP-based upload/download limits
  - Request tracking per IP
  - Daily bandwidth limits
  - Secure file access control

- Monitoring & Logging

  - Request tracing with unique IDs
  - Structured JSON logging
  - HTTP request logging

- API Features
  - OpenAPI/Swagger documentation
  - API versioning
  - Custom response formatting
  - Global error handling
  - Request validation

### Environment Variables

#### Docker Configuration

```env
COMPOSE_PROJECT_NAME=file-sharing-api
DOCKER_BUILD_MODE=dev
BACKEND_HTTP_PUBLISH_PORT=9505
TIMEZONE=Asia/Dhaka
```

#### Backend Configuration

```env
# File Management
FILE_UPLOAD_PATH=./uploads
FILE_UPLOAD_SERVICE_PROVIDER=local
MAX_UPLOAD_BYTES_PER_IP=524288000
MAX_DOWNLOAD_BYTES_PER_IP=524288000

# Database
DB_RELATIVE_PATH=./data/files.db

# File Cleanup
FILE_CLEANUP_ENABLED=true
FILE_CLEANUP_INACTIVITY_DAYS=7
FILE_CLEANUP_SCHEDULE="0 0 * * *"
```

### Development

1. Clone and setup:

```bash
git clone https://github.com/abdur-rakib/file-sharing-app.git
cd file-sharing-app
```

2. Configure environment:

```bash
cp docker/.example.env docker/.env
cp docker/docker-compose.override.example.yml docker/docker-compose.override.yml
cp docker/.envs/backend.example.env docker/.envs/backend.env
```

3. Start development server:

```bash
cd docker
docker-compose up backend
```

### API Documentation

Access Swagger UI: `http://localhost:9505/api-docs`

#### Endpoints

- **Files**
  - `POST /api/v1/files` - Upload file
  - `GET /api/v1/files/:publicKey` - Download file
  - `DELETE /api/v1/files/:privateKey` - Delete file

### Testing

```bash
# Exec backend docker container and follow the bellow steps
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT License - see [LICENSE](LICENSE) file

## Support

- Create an issue in the repository
- Email: abdurrakib961@gmail.com
