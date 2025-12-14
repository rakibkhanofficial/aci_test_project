#!/bin/bash

echo "🔍 CHIMERA AI - Medical Image Analysis - Setup Verification"
echo "============================================================"
echo ""

# Color codes (only green and red)
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Docker
echo -n "Checking Docker... "
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker is running${NC}"
else
    echo -e "${RED}✗ Docker is not running${NC}"
    echo "  Please start Docker Desktop"
    exit 1
fi

# Check Docker Compose
echo -n "Checking Docker Compose... "
if docker compose version > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Docker Compose is available${NC}"
else
    echo -e "${RED}✗ Docker Compose not found${NC}"
    exit 1
fi

# Check .env files
echo ""
echo "Checking environment files..."

# Check root .env file
if [ ! -f .env ]; then
    echo -e "${RED}✗ .env file not found in root${NC}"
    echo "  Creating from template..."
    
    # Create root .env file with your exact values
    cat > .env << 'EOF'
# Gemini API Key
GEMINI_API_KEY=AIzaSyD7y70_mvhQOvdwgO61aB1xQCUYpDOKl7k

# NextAuth Secret
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database
DATABASE_URL=postgresql://chimera:chimera_secure_pass@localhost:5432/chimera_db
EOF
    
    echo -e "${GREEN}✓ Created .env file${NC}"
else
    echo -e "${GREEN}✓ Root .env file exists${NC}"
fi

# Check backend .env file
if [ ! -f backend/.env ]; then
    echo -e "${RED}✗ backend/.env not found${NC}"
    echo "  Creating from template..."
    
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
    
    echo -e "${GREEN}✓ Created backend/.env file${NC}"
else
    echo -e "${GREEN}✓ Backend .env file exists${NC}"
fi

# Check frontend .env.local file
if [ ! -f frontend/.env.local ]; then
    echo -e "${RED}✗ frontend/.env.local not found${NC}"
    echo "  Creating from template..."
    
    cat > frontend/.env.local << 'EOF'
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
EOF
    
    echo -e "${GREEN}✓ Created frontend/.env.local file${NC}"
else
    echo -e "${GREEN}✓ Frontend .env.local file exists${NC}"
fi

# Check file structure
echo ""
echo "Checking project structure..."

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}  ✓ $2${NC}"
    else
        echo -e "${RED}  ✗ $2 not found${NC}"
    fi
}

check_file "docker-compose.yml" "docker-compose.yml"
check_file "backend/Dockerfile" "Backend Dockerfile"
check_file "frontend/Dockerfile" "Frontend Dockerfile"
check_file "backend/app/main.py" "Backend main.py"
check_file "frontend/package.json" "Frontend package.json"
check_file "frontend/app/page.tsx" "Frontend page.tsx"

# Check if backend has requirements.txt or pyproject.toml
if [ -f "backend/requirements.txt" ]; then
    echo -e "${GREEN}  ✓ Backend requirements.txt found${NC}"
elif [ -f "backend/pyproject.toml" ]; then
    echo -e "${GREEN}  ✓ Backend pyproject.toml found${NC}"
else
    echo -e "${RED}  ✗ No backend dependencies file found${NC}"
fi

echo ""
echo "==========================================="
echo -e "${GREEN}✅ Setup verification complete!${NC}"
echo ""
echo "To start the application:"
echo -e "  ${GREEN}docker compose up --build${NC}"
echo ""
echo "Or run the start script:"
echo -e "  ${GREEN}./start.sh${NC}"