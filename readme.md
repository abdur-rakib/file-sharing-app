# File Sharing Application

A modern and secure file sharing application built with NestJS backend, featuring Docker containerization, SQLite database, and file upload, download and delete support.

## Project Structure

```
file-sharing-app/
├── codes/
│   └── backend/         # NestJS backend application
│       ├── src/        # Source code
│       │   ├── modules/    # Feature modules
│       │   ├── common/     # Shared utilities, interfaces
│       │   ├── config/     # Configuration
│       │   ├── interceptors/     # Custom Interceptors
│       │   ├── filters/     # Custom Filters
│       │   └── middlewares/# Custom middlewares
│       └── test/       # Test files
├── docker/             # Docker configuration files
│   ├── backend/        # Backend-specific docker files
│   ├── docker-compose.yml        # Main docker compose file
│   ├── docker-compose.override.yml # Local development overrides
│   └── .envs/         # Environment configurations
└── README.md
```

## Prerequisites

- Node.js (v23+)
- Docker (latest stable version)
- Docker Compose (v2.0+)
- Git

## Features

### Backend (NestJS)

- File Upload/Download/Delete System
  - Local file storage support
  - Google Cloud Storage support (configurable)
  - File size tracking
  - IP-based upload/download limits
  - User can delete files
- Database
  - SQLite with better-sqlite3
  - File metadata storage
  - IP usage tracking
- API Features
  - RESTful endpoints with versioning
  - Swagger API documentation
  - Request logging
  - Custom response formatting
  - Global error handling
- Security
  - IP-based rate limiting
  - File size restrictions (Not imeplemented yet)
  - Secure file access via public/private keys
- Monitoring
  - Custom logging system
  - Request tracing with request IDs
  - HTTP request logging

### Docker Support

- Multi-stage builds (`dev`/`prod`)
- Volume mounting for development
- Environment configuration

## Getting Started

### Environment Setup

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

3. Environment Variables:

- Docker Environment:

  - `COMPOSE_PROJECT_NAME`: Project name for Docker
  - `DOCKER_BUILD_MODE`: Build target (`dev`/`prod`)
  - `BACKEND_HTTP_PUBLISH_PORT`: API port (default: 9505)
  - `TIMEZONE`: Container timezone

- Backend Environment:
  - `FILE_UPLOAD_PATH`: Upload directory path
  - `MAX_UPLOAD_BYTES_PER_IP`: Upload limit per IP in bytes
  - `MAX_DOWNLOAD_BYTES_PER_IP`: Download limit per IP in bytes
  - `FILE_UPLOAD_SERVICE_PROVIDER`: Storage provider (`local`/`google`)
  - `DB_RELATIVE_PATH`: SQLite database path

### Development

1. Start the development server:

```bash
cd docker
docker-compose up backend
```

2. Access points:

- API: `http://localhost:9505/api/v1`
- Swagger Docs: `http://localhost:9505/api-docs`

### API Endpoints

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

For support:

- Create an issue in the repository
- Email: abdurrakib961@gmail.com
