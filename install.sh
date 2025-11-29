#!/bin/bash

echo "======================================"
echo "NHS EPROMS Installation Script"
echo "======================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Error: Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Error: Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✓ Docker and Docker Compose are installed"
echo ""

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env and update the following:"
    echo "   - JWT_SECRET (set a strong random secret)"
    echo "   - SMTP_* (configure email if you want notifications)"
    echo "   - NHS_SSO_* (configure NHS SSO if available)"
    echo ""
    read -p "Press Enter to continue after you've edited .env..."
else
    echo "✓ .env file already exists"
fi

echo ""
echo "Installing root dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "Error: Failed to install root dependencies"
    exit 1
fi

echo "✓ Root dependencies installed"
echo ""

echo "Building Docker containers..."
docker-compose build

if [ $? -ne 0 ]; then
    echo "Error: Failed to build Docker containers"
    exit 1
fi

echo "✓ Docker containers built successfully"
echo ""

echo "Starting services..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo "Error: Failed to start services"
    exit 1
fi

echo "✓ Services started"
echo ""

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 10

echo ""
echo "======================================"
echo "Installation Complete!"
echo "======================================"
echo ""
echo "The EPROMS system is now running:"
echo ""
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:3001"
echo "  Database:  localhost:5432"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"
echo ""
echo "To stop the system:"
echo "  npm run docker:down"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000/register to create your first account"
echo "2. For clinicians, update the role in the database or use NHS SSO"
echo "3. Refer to SETUP.md for detailed configuration"
echo ""
