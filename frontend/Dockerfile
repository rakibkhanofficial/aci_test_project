# Frontend Dockerfile - Fixed
FROM node:18-alpine

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json* ./

# Install ALL dependencies (including dev dependencies)
RUN npm ci --include=dev

# Copy source code
COPY . .

# Create .next directory for caching
RUN mkdir -p .next

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev"]