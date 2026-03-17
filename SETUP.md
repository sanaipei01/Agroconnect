# Agro-Connect Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally on port 27017)
- npm or yarn

## Backend Setup

### 1. Install Dependencies
```bash
cd backend
npm install
npm install --save-dev jest supertest  # For testing
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and update if needed:
```bash
cp .env.example .env
```

### 3. Run the Server
```bash
npm start
```
Server will start on `http://localhost:5000`

### 4. Run Tests
```bash
npm test
```

Or watch mode for development:
```bash
npm run test:watch
```

## Frontend Setup

### 1. Open in Browser
Navigate to `http://localhost:5000` in your browser once the backend server is running.

The backend serves static files from the frontend folder.

## API Testing

### Tools Recommended:
- **Postman**: For manual API testing
- **Jest + Supertest**: For automated unit tests (included in test suite)
- **Thunder Client**: VS Code extension for API testing

### Quick Test Examples:

#### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@example.com",
    "password": "password123",
    "role": "farmer"
  }'
```

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## CI/CD Configuration

For GitHub Actions, create `.github/workflows/test.yml`:
```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd backend
          npm install
      
      - name: Run tests
        run: |
          cd backend
          npm test
```

## MongoDB

Ensure MongoDB is running:
```bash
# On Windows, if using MongoDB installed locally:
mongod

# Or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:6
```

## Troubleshooting

**Port 5000 already in use:**
```bash
netstat -ano | findstr :5000  # Windows
lsof -i :5000  # Mac/Linux
```

**MongoDB connection error:**
- Ensure MongoDB service is running
- Check connection string in `.env`

**Tests not running:**
- Ensure test database is accessible
- Check `jest.config.js` configuration
