# File Sharing Application

A modern and secure file sharing application built with NestJS backend, featuring Docker containerization and environment-based configuration.

## Project Structure

```
file-sharing-app/
├── codes/
│   └── backend/         # NestJS backend application
│       ├── src/        # Source code
│       ├── test/       # Test files
├── docker/             # Docker configuration files
│   ├── backend/        # Backend-specific docker files
│   ├── docker-compose.yml        # Main docker compose file
│   ├── docker-compose.override.yml # Local development overrides
│   └── .envs/         # Environment configurations
└── README.md          # This file
```

## Prerequisites

- Node.js (v23+)
- Docker (latest stable version)
- Docker Compose (v2.0+)
- Git

## Getting Started

### Environment Setup

1. Clone the repository:

```bash
git clone https://github.com/abdur-rakib/file-sharing-app.git
cd file-sharing-app
```

2. Copy and configure environment files:

```bash
cp docker/.example.env docker/.env
cp docker/docker-compose.override.example.yml docker/docker-compose.override.yml
cp docker/.envs/backend.example.env docker/.envs/backend.env  # backend env
```

3. Configure the environment variables in the `.env` files according to your needs:
   - `BACKEND_HTTP_PUBLISH_PORT`: Default is 9505
   - backend app environment-specific variables in `backend.env`

### Running with Docker

1. Build and start the backend containers:

```bash
cd docker
docker-compose build backend
docker-compose up backend
```

2. Access points:
   - Backend API: `http://localhost:9505` (or your configured HTTP_PUBLISH_PORT)
   - API Documentation: `http://localhost:9505/api/docs`

### Testing

Run the test suite from the backend directory:

Exec the backend container and then run

```bash
npm test          # Unit tests
npm run test:e2e  # E2E tests
npm run test:cov  # Test coverage
```

## Features

- **Backend (NestJS)**

  - RESTful API endpoints
  - Swagger API documentation
  - JWT authentication
  - File upload/download capabilities
  - Environment-based configuration
  - TypeScript support
  - Unit and E2E testing

- **Docker Support**
  - Multi-stage builds
  - Development and production configurations
  - Volume mounting for hot-reload
  - Environment variable management

## Project Commands

### Backend Commands

```bash
npm run build         # Build the application
npm run start         # Start the application
npm run start:dev     # Start in development mode with watch
npm run start:debug   # Start in debug mode
npm run start:prod    # Start in production mode
npm run lint         # Lint the code
npm run test         # Run tests
npm run migration:run # Run database migrations
npm run migration:revert # Revert last migration
```

## Docker Configuration

The project uses multi-stage Docker builds with different targets:

- `dev`: Development environment with hot-reload
- `prod`: Production-optimized build

### Environment Variables

Key environment variables:

- `HTTP_PUBLISH_PORT`: Port for the backend service
- `NODE_ENV`: Environment mode (development/production)
- `DATABASE_URL`: Database connection string
- `JWT_SECRET`: Secret for JWT token generation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright © abdur-rakib. All rights reserved.

## Support

For support, email <your-email@example.com> or create an issue in the repository.
