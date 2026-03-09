#!/bin/bash

# Resume to Portfolio - Setup Script
# This script automates the initial setup process

echo "🚀 Resume to Portfolio Generator - Setup Script"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo "📦 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python is not installed. Please install Python 3.10+ first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Python found: $(python3 --version)${NC}"
fi

# Check if MongoDB is installed (optional)
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB found: $(mongod --version | head -n 1)${NC}"
else
    echo -e "${BLUE}⚠️  MongoDB not found. You can use MongoDB Atlas instead.${NC}"
fi

echo ""
echo "📥 Installing dependencies..."
echo ""

# Frontend setup
echo -e "${BLUE}1. Setting up Frontend...${NC}"
cd frontend || exit
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
    else
        echo -e "${RED}❌ Frontend installation failed${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Frontend dependencies already installed${NC}"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${BLUE}📝 Created frontend/.env from template${NC}"
    echo -e "${RED}⚠️  Please update frontend/.env with your Firebase credentials${NC}"
fi

cd ..

# Backend setup
echo ""
echo -e "${BLUE}2. Setting up Backend...${NC}"
cd backend || exit

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo -e "${GREEN}✅ Virtual environment already exists${NC}"
fi

# Activate virtual environment and install dependencies
source venv/bin/activate
pip install -r requirements.txt

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend installation failed${NC}"
    exit 1
fi

# Download spaCy model
echo -e "${BLUE}📥 Downloading spaCy language model...${NC}"
python3 -m spacy download en_core_web_sm
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ spaCy model downloaded${NC}"
else
    echo -e "${RED}❌ spaCy model download failed${NC}"
fi

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${BLUE}📝 Created backend/.env from template${NC}"
    echo -e "${RED}⚠️  Please update backend/.env with your configuration${NC}"
fi

cd ..

echo ""
echo -e "${GREEN}✨ Setup Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "1. Update frontend/.env with your Firebase credentials"
echo "2. Update backend/.env with your database and secret key"
echo "3. Place firebase-credentials.json in the backend folder"
echo "4. Start MongoDB (if using local instance)"
echo "5. Run 'cd backend && source venv/bin/activate && python main.py'"
echo "6. In another terminal: 'cd frontend && npm run dev'"
echo ""
echo "📚 Documentation:"
echo "- Quick Start: QUICKSTART.md"
echo "- Setup Guide: SETUP.md"
echo "- API Docs: API_DOCUMENTATION.md"
echo ""
echo "🎉 Happy coding!"
