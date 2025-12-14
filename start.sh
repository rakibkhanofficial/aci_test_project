#!/bin/bash

echo "🚀 CHIMERA AI - Medical Image Analysis"
echo "======================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running!${NC}"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"

# Ensure .env files exist
echo ""
echo "📁 Ensuring environment files exist..."

if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << 'EOF'
# Gemini API Key
GEMINI_API_KEY=AIzaSyD7y70_mvhQOvdwgO61aB1xQCUYpDOKl7k

# NextAuth Secret
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database
DATABASE_URL=postgresql://chimera:chimera_secure_pass@localhost:5432/chimera_db
EOF
fi

if [ ! -f backend/.env ]; then
    echo "Creating backend/.env file..."
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
fi

if [ ! -f frontend/.env.local ]; then
    echo "Creating frontend/.env.local file..."
    cat > frontend/.env.local << 'EOF'
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
fi

echo -e "${GREEN}✅ Environment files ready${NC}"

echo ""
echo "🔨 Building and starting containers..."
echo "   This may take 5-10 minutes on first run..."
echo ""

# Build and start with docker compose
docker compose up --build -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start containers${NC}"
    echo "   Check the error messages above."
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Containers started successfully${NC}"
echo ""
echo "⏳ Waiting for services to be ready..."

# Simple wait for services
sleep 30

echo ""
echo "=========================================="
echo -e "${GREEN}🚀 CHIMERA AI is now running!${NC}"
echo "=========================================="
echo ""
echo "🌐 Access the application:"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend:  ${GREEN}http://localhost:8000${NC}"
echo -e "   API Docs: ${GREEN}http://localhost:8000/docs${NC}"
echo ""
echo "🔧 Useful commands:"
echo "   View logs:      docker compose logs -f"
echo "   Stop:           docker compose down"
echo "   Check status:   docker compose ps"
echo "   Shell backend:  docker compose exec backend bash"
echo ""
echo "🛑 To stop: docker compose down"