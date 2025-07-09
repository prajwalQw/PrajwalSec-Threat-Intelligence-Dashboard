PrajwalSec - Threat Intelligence Dashboard
A comprehensive, production-ready threat intelligence dashboard for cybersecurity analysis and monitoring. Built with React frontend, Flask backend, and MySQL database.

🚀 Features
Core Functionality
Real-time Threat Monitoring: Live dashboard with threat statistics and trends
Advanced Analytics: ML-powered threat analysis and classification
Threat Intelligence: Comprehensive threat database with IOCs and recommendations
Interactive Visualizations: Charts and graphs for threat data visualization
Responsive Design: Works perfectly on desktop, tablet, and mobile devices
Technical Features
RESTful API: Flask-based backend with comprehensive endpoints
Database Integration: MySQL with optimized schema and indexes
Security: Rate limiting, input validation, and error handling
Dockerized: Complete containerization for easy deployment
Scalable Architecture: Modular design for easy expansion
Tech Stack
Frontend: React.js
Backend: Flask (Python)
Database: MySQL
Containerization: Docker
Prerequisites
Make sure the following are installed:

Node.js 18+
Python 3.9+
MySQL 8+
Docker + Docker Compose (for containerized setup)
Run the Project
Option 1: Run with Docker (Recommended)
Clone the Repository

git clone https://github.com/your-username/threat-intelligence-dashboard.git
cd threat-intelligence-dashboard
Set Environment Variables

cp backend/.env.example backend/.env
# Then edit backend/.env with your values
Start the App

docker-compose up -d
Access the App

Frontend: http://localhost:3000
Backend: http://localhost:5000
Option 2: Run Locally Without Docker
1. Setup MySQL Database
mysql -u root -p
CREATE DATABASE threat_intelligence;
2. Setup Backend (Flask)
cd backend
python -m venv venv
source venv/bin/activate  # Use venv\Scripts\activate on Windows
pip install -r requirements.txt

cp .env.example .env
# Fill in database credentials

python data_ingestion.py  # Optional: load sample data
python app.py
3. Setup Frontend (React)
cd ../frontend
npm install
npm start
How to Run Tests
Backend Tests
cd backend
pytest tests/
Frontend Tests
cd frontend
npm test
Docker-Based Integration Tests
docker-compose -f docker-compose.test.yml up --abort-on-container-exit
Example API Endpoint
Try it in your browser or Postman:

GET http://localhost:5000/api/threats
Project Structure
. ├── backend/ # Flask API and ingestion scripts ├── frontend/ # React frontend UI ├── docker-compose.yml ├── README.md # Project documentation └── docs/ # Additional documentation (API, database, deployment)

---

## Documentation
- API: `docs/api.md`
- Deployment: `docs/deployment.md`
- Database Schema: `docs/database.md`

---



---
