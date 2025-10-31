#!/bin/bash

# 🧪 Test CI Pipeline Locally
# This script simulates the GitHub Actions workflow

set -e

echo "🚀 Testing CI Pipeline Locally..."
echo "================================"

REPO_ROOT="/Users/bs01080/Desktop/Practice/file-sharing-app"
cd "$REPO_ROOT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Status tracking
CODE_QUALITY_STATUS="❌"
TEST_STATUS="❌"
DOCKER_STATUS="❌"
SECURITY_STATUS="❌"
OVERALL_STATUS="❌"

echo ""
echo -e "${BLUE}🔍 Step 1: Code Quality & Security Checks${NC}"
echo "================================================"

cd codes/backend

echo "📦 Installing dependencies..."
if npm ci --prefer-offline --no-audit; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""
echo "🔍 Running linter..."
if npm run lint; then
    echo "✅ Linting passed"
else
    echo "⚠️ Linting issues found (continuing...)"
fi

echo ""
echo "🏗️ Building application..."
if npm run build; then
    echo "✅ Build successful"
    CODE_QUALITY_STATUS="✅"
    echo "📁 Build output:"
    ls -la dist/ || echo "No dist directory found"
else
    echo "❌ Build failed"
    exit 1
fi

echo ""
echo -e "${BLUE}🧪 Step 2: Testing Suite${NC}"
echo "================================"

echo "🧪 Running unit tests..."
if npm test; then
    echo "✅ Unit tests passed"
else
    echo "❌ Unit tests failed"
    exit 1
fi

echo ""
echo "📊 Generating coverage report..."
if npm run test:cov; then
    echo "✅ Coverage report generated"
else
    echo "❌ Coverage generation failed"
    exit 1
fi

echo ""
echo "✅ Validating coverage thresholds..."
if node check-coverage.js; then
    echo "✅ Coverage validation passed"
    TEST_STATUS="✅"
else
    echo "❌ Coverage validation failed"
    exit 1
fi

echo ""
echo -e "${BLUE}🐳 Step 3: Docker Build & Test${NC}"
echo "==================================="

cd "$REPO_ROOT/docker"

echo "🐳 Building Docker image..."
if docker-compose build backend; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    exit 1
fi

echo ""
echo "🧪 Testing Docker container..."
echo "Starting services in background..."
docker-compose up -d

echo "⏳ Waiting for backend to start..."
sleep 15

# Test health endpoint
if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "✅ Docker health check passed"
    DOCKER_STATUS="✅"
else
    echo "❌ Docker health check failed"
    docker-compose down
    exit 1
fi

echo "🧹 Cleaning up Docker containers..."
docker-compose down

echo ""
echo -e "${BLUE}🔒 Step 4: Security Audit${NC}"
echo "============================="

cd "$REPO_ROOT/codes/backend"

echo "🔍 Running security audit..."
if npm audit --audit-level high; then
    echo "✅ Security audit passed"
    SECURITY_STATUS="✅"
else
    echo "⚠️ Security vulnerabilities found (review required)"
    # Don't exit here, just warn
    SECURITY_STATUS="⚠️"
fi

echo ""
echo "🛡️ Running audit-ci..."
if npx audit-ci --config .auditci.json; then
    echo "✅ Audit CI passed"
    if [ "$SECURITY_STATUS" = "⚠️" ]; then
        SECURITY_STATUS="⚠️"
    else
        SECURITY_STATUS="✅"
    fi
else
    echo "⚠️ Audit CI completed with warnings"
    SECURITY_STATUS="⚠️"
fi

echo ""
echo -e "${BLUE}🛡️ Step 5: Branch Protection Check${NC}"
echo "========================================="

# Determine overall status
if [ "$CODE_QUALITY_STATUS" = "✅" ] && [ "$TEST_STATUS" = "✅" ] && [ "$DOCKER_STATUS" = "✅" ] && [ "$SECURITY_STATUS" = "✅" ]; then
    OVERALL_STATUS="✅"
elif [ "$SECURITY_STATUS" = "⚠️" ] && [ "$CODE_QUALITY_STATUS" = "✅" ] && [ "$TEST_STATUS" = "✅" ] && [ "$DOCKER_STATUS" = "✅" ]; then
    OVERALL_STATUS="⚠️"
else
    OVERALL_STATUS="❌"
fi

echo ""
echo "📊 Final CI Pipeline Status:"
echo "==========================="
echo -e "🔍 Code Quality: ${CODE_QUALITY_STATUS}"
echo -e "🧪 Tests: ${TEST_STATUS}"
echo -e "🐳 Docker: ${DOCKER_STATUS}"
echo -e "🔒 Security: ${SECURITY_STATUS}"
echo "==========================="

if [ "$OVERALL_STATUS" = "✅" ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo -e "${GREEN}🚀 READY TO MERGE!${NC}"
    exit 0
elif [ "$OVERALL_STATUS" = "⚠️" ]; then
    echo -e "${YELLOW}⚠️ ALL CHECKS PASSED WITH WARNINGS!${NC}"
    echo -e "${YELLOW}🚀 READY TO MERGE (review security warnings)${NC}"
    exit 0
else
    echo -e "${RED}❌ MERGE BLOCKED!${NC}"
    echo -e "${RED}🚫 One or more required checks failed!${NC}"
    exit 1
fi