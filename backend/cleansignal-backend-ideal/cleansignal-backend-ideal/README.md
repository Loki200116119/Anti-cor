# CleanSignal Backend 🛡️

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3.36+-blue.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Professional FastAPI backend for CleanSignal anti-corruption platform with enterprise-grade security, authentication, and monitoring features.

## 🌟 Features

### 🔐 **Authentication & Security**
- JWT-based authentication with secure password hashing
- Role-based access control (User/Admin)
- File security scanning and malware detection
- PII (Personal Identifiable Information) minimization and encryption
- Rate limiting protection

### 📊 **Report Management**
- Anonymous report creation with quality validation
- AI-powered analysis (OpenAI GPT integration with rule-based fallback)
- Evidence file upload with comprehensive security checks
- Real-time report tracking with unique tracking IDs
- Moderator messaging system
- Report status management

### 🛠️ **Developer Experience**
- Structured logging with JSON output
- Comprehensive API documentation (Swagger/ReDoc)
- Database migrations with Alembic
- Automated testing with pytest
- Health monitoring endpoints

### 📈 **Analytics & Statistics**
- Report statistics and analytics
- Geographic data visualization
- Contact form handling
- Timeline tracking for reports

## 🚀 Quick Start

### Prerequisites
- Python 3.8 or higher
- pip package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/cleansignal-backend.git
   cd cleansignal-backend
   ```

2. **Create virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate

   # Linux/Mac
   python -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment setup**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env file with your settings
   # Required: SECRET_KEY, DATABASE_URL
   # Optional: OPENAI_API_KEY for AI features
   ```

5. **Database setup**
   ```bash
   # Run database migrations
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   python app/main.py

   # Or using uvicorn directly
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Access the application**
   - **API Documentation:** http://127.0.0.1:8000/docs
   - **Alternative Docs:** http://127.0.0.1:8000/redoc
   - **Health Check:** http://127.0.0.1:8000/health

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database
DATABASE_URL=sqlite:///./cleansignal.db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# OpenAI (Optional)
OPENAI_API_KEY=sk-your-openai-api-key
USE_OPENAI_AI=true
OPENAI_MODEL=gpt-4

# Logging
LOG_LEVEL=INFO
```

### Optional AI Features

The backend supports AI-powered report analysis using OpenAI GPT. If the API key is not provided or OpenAI is unavailable, it automatically falls back to rule-based analysis.

## 📚 API Documentation

### Authentication Endpoints

```http
POST /auth/register  # User registration
POST /auth/login     # User login
GET  /auth/me        # Get current user info
GET  /auth/users     # Admin: List all users
```

### Report Endpoints

```http
POST /reports                    # Create new report
GET  /reports                    # List reports (paginated)
GET  /reports/{id}              # Get specific report
PUT  /reports/{id}/status       # Update report status (admin)
POST /reports/{id}/evidence     # Upload evidence file
POST /reports/{id}/messages     # Add moderator message
GET  /reports/track/{tracking_id} # Track report by ID
```

### Analytics Endpoints

```http
GET /stats/summary    # General statistics
GET /stats/map        # Geographic data
GET /contact          # Contact form
```

### System Endpoints

```http
GET /health          # Health check
GET /                 # API information
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Run basic tests
python run_tests.py

# Run full test suite
pytest test_backend.py -v

# Run with coverage
pytest --cov=app --cov-report=html
```

## 🏗️ Project Structure

```
cleansignal-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── database.py          # Database configuration
│   ├── models.py            # SQLAlchemy models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # JWT authentication
│   ├── security.py          # File security & PII
│   ├── logging_config.py    # Structured logging
│   ├── rate_limits.py       # Rate limiting config
│   ├── ai.py                # AI analysis logic
│   ├── utils.py             # Utility functions
│   └── routers/
│       ├── __init__.py
│       ├── auth.py          # Authentication routes
│       ├── reports.py       # Report management
│       ├── stats.py         # Statistics routes
│       └── contact.py       # Contact form
├── alembic/                 # Database migrations
├── logs/                    # Application logs
├── uploads/                 # File uploads directory
├── test_backend.py          # Comprehensive tests
├── run_tests.py            # Basic test runner
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
└── README.md              # This file
```

## 🔧 Development

### Code Quality

```bash
# Format code
black app/ tests/

# Lint code
flake8 app/ tests/

# Type checking
mypy app/
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Migration message"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🚀 Deployment

### Production Deployment

1. **Set environment variables for production**
2. **Use a production WSGI server**
   ```bash
   pip install gunicorn
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

3. **Use a reverse proxy (nginx recommended)**
4. **Set up SSL certificates**
5. **Configure proper logging**

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN alembic upgrade head

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 style guidelines
- Write comprehensive tests for new features
- Update documentation for API changes
- Ensure all tests pass before submitting PR

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [SQLAlchemy](https://www.sqlalchemy.org/) - Python SQL toolkit
- [Pydantic](https://pydantic-docs.helpmanual.io/) - Data validation
- [OpenAI](https://openai.com/) - AI analysis capabilities

## 📞 Support

For support, email support@cleansignal.org or create an issue in this repository.

---

**CleanSignal** - Fighting corruption through technology 🛡️✨
  body: JSON.stringify(report)
});
```

Track:

```js
await fetch(`${API_BASE}/reports/track/${trackingId}`);
```
