#!/bin/bash

echo "🚀 CHIMERA AI - Development Environment"
echo "======================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Docker
print_info "Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running!"
    echo "  Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker is running"

# Check Docker Compose
print_info "Checking Docker Compose..."
if ! docker compose version > /dev/null 2>&1; then
    print_error "Docker Compose not found!"
    exit 1
fi
print_success "Docker Compose is available"

# Ensure .env files exist
print_info "Checking environment files..."

if [ ! -f .env ]; then
    print_info "Creating .env file..."
    cat > .env << 'EOF'
# Gemini API Key
GEMINI_API_KEY=AIzaSyD7y70_mvhQOvdwgO61aB1xQCUYpDOKl7k

# NextAuth Secret
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database
DATABASE_URL=postgresql://chimera:chimera_secure_pass@localhost:5432/chimera_db
EOF
    print_success "Created .env file"
else
    print_success ".env file exists"
fi

if [ ! -f backend/.env ]; then
    print_info "Creating backend/.env file..."
    mkdir -p backend
    cat > backend/.env << 'EOF'
# Database
DATABASE_URL=postgresql://chimera:chimera_secure_pass@localhost:5432/chimera_db

# Security
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI
GEMINI_API_KEY=AIzaSyD7y70_mvhQOvdwgO61aB1xQCUYpDOKl7k

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]
EOF
    print_success "Created backend/.env file"
else
    print_success "backend/.env file exists"
fi

if [ ! -f frontend/.env.local ]; then
    print_info "Creating frontend/.env.local file..."
    mkdir -p frontend
    cat > frontend/.env.local << 'EOF'
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
    print_success "Created frontend/.env.local file"
else
    print_success "frontend/.env.local file exists"
fi

# Check for development docker-compose file
DEV_COMPOSE_FILE=""
if [ -f "docker-compose.dev.yml" ]; then
    DEV_COMPOSE_FILE="-f docker-compose.yml -f docker-compose.dev.yml"
    print_info "Using docker-compose.dev.yml for development"
elif [ -f "docker-compose.override.yml" ]; then
    DEV_COMPOSE_FILE="-f docker-compose.yml -f docker-compose.override.yml"
    print_info "Using docker-compose.override.yml for development"
else
    DEV_COMPOSE_FILE="-f docker-compose.yml"
    print_info "Using standard docker-compose.yml"
fi

# Development mode options
echo ""
echo "🔧 Development Mode Options:"
echo "   1. Start all services (default)"
echo "   2. Start only backend services"
echo "   3. Start only frontend service"
echo "   4. Rebuild and start"
echo "   5. Start with live reload"
echo ""
read -p "Select option (1-5): " -n 1 -r
echo ""

case $REPLY in
    2)
        print_info "Starting only backend services (database + backend)..."
        docker compose $DEV_COMPOSE_FILE up db backend -d
        ;;
    3)
        print_info "Starting only frontend service..."
        docker compose $DEV_COMPOSE_FILE up frontend -d
        ;;
    4)
        print_info "Rebuilding and starting all services..."
        docker compose $DEV_COMPOSE_FILE up --build -d
        ;;
    5)
        print_info "Starting with live reload enabled..."
        # Check if compose file supports hot reload
        if [ -f "docker-compose.dev.yml" ]; then
            docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
        else
            print_info "No dev compose found, starting standard with logs..."
            docker compose up --build
        fi
        exit 0  # Exit here since we're running in foreground
        ;;
    *)
        print_info "Starting all services in development mode..."
        docker compose $DEV_COMPOSE_FILE up -d
        ;;
esac

# Wait a moment for services to start
print_info "Waiting for services to initialize..."
sleep 5

# Check if services are running
print_info "Checking service status..."
if docker compose ps | grep -q "Up"; then
    print_success "Services are running!"
else
    print_error "Some services failed to start"
    echo "Check logs with: docker compose logs"
    exit 1
fi

# Show service URLs
echo ""
echo "=========================================="
echo -e "${GREEN}🚀 Development Environment Ready!${NC}"
echo "=========================================="
echo ""
echo "🌐 Service URLs:"
echo -e "   Frontend:     ${BLUE}http://localhost:3000${NC}"
echo -e "   Backend API:  ${BLUE}http://localhost:8000${NC}"
echo -e "   API Docs:     ${BLUE}http://localhost:8000/docs${NC}"
echo -e "   Database:     ${BLUE}PostgreSQL on port 5432${NC}"
echo ""
echo "📊 Health Check Endpoints:"
echo -e "   Backend Health: ${BLUE}http://localhost:8000/health${NC}"
echo -e "   Backend Ready:  ${BLUE}http://localhost:8000/ready${NC}"
echo ""
echo "🔧 Development Commands:"
echo "   View logs (all):       docker compose logs -f"
echo "   View logs (backend):   docker compose logs backend -f"
echo "   View logs (frontend):  docker compose logs frontend -f"
echo "   View logs (database):  docker compose logs db -f"
echo ""
echo "💻 Interactive Shells:"
echo "   Backend shell:    docker compose exec backend bash"
echo "   Database shell:   docker compose exec db psql -U chimera -d chimera_db"
echo ""
echo "⚡ Quick Actions:"
echo "   Restart backend:  docker compose restart backend"
echo "   Restart frontend: docker compose restart frontend"
echo "   Stop all:         docker compose down"
echo "   Rebuild:          docker compose build --no-cache"
echo ""
echo "🐛 Debug Commands:"
echo "   Check backend:    curl http://localhost:8000/health"
echo "   Check frontend:   curl -I http://localhost:3000"
echo "   Check database:   docker compose exec db pg_isready"
echo ""
echo "📝 Development Notes:"
echo "   • Frontend hot reload should be enabled"
echo "   • Backend auto-reload on code changes"
echo "   • Database data persists in docker volume"
echo "   • API changes available immediately at /docs"
echo ""
echo "🛑 To stop development environment:"
echo -e "   ${BLUE}docker compose down${NC}"
echo "=========================================="

# Optional: Open browser
echo ""
read -p "Open frontend in browser? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open > /dev/null; then
        xdg-open http://localhost:3000
    elif command -v open > /dev/null; then
        open http://localhost:3000
    else
        echo "Please open: http://localhost:3000"
    fi
fi

# Show logs option
echo ""
read -p "Show service logs? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Showing logs (Ctrl+C to exit)..."
    docker compose logs -f --tail=50
fi