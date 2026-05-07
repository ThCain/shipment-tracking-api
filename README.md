# 🚚 Shipment Tracking API

A RESTful backend service for managing and tracking shipment operations, built with **FastAPI** and SQL database support (SQLite by default, PostgreSQL optional).

## 🛠 Tech Stack

- **Python 3.11**
- **FastAPI** – API framework
- **SQLite (default)** / **PostgreSQL (optional)** – Relational database
- **SQLAlchemy** – ORM
- **Alembic** – Database migrations
- **Pydantic** – Data validation
- **Docker** – Containerization

## 📦 Features

- Create, update, and delete shipment records
- Track shipment status in real-time (Pending → In Transit → Delivered)
- Filter shipments by date range, status, and destination
- RESTful endpoints with full CRUD support
- Input validation and error handling with descriptive responses
- JWT-based authentication for protected routes

## 📁 Project Structure

```
shipment-tracking-api/
├── app/
│   ├── main.py
│   ├── models/
│   │   └── shipment.py
│   ├── schemas/
│   │   └── shipment.py
│   ├── routers/
│   │   └── shipment.py
│   ├── database.py
│   └── auth/
│       └── jwt.py
├── alembic/
├── requirements.txt
├── Dockerfile
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Docker (optional)

### Installation

```bash
git clone https://github.com/ThCain/shipment-tracking-api.git
cd shipment-tracking-api
pip install -r requirements.txt
```

### Configure Environment

```bash
cp .env.example .env
# Default runs on SQLite (shipment.db)
# Optional: set DATABASE_URL to your PostgreSQL DSN
```

### Run Backend

```bash
uvicorn app.main:app --reload
```

Visit `http://localhost:8000/docs` for the interactive Swagger UI.

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is served on Vite's default URL (usually `http://localhost:5173`) and talks to backend at `http://localhost:8000`.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/shipments` | List all shipments |
| GET | `/shipments/{id}` | Get shipment by ID |
| POST | `/shipments` | Create a new shipment |
| PUT | `/shipments/{id}` | Update shipment |
| DELETE | `/shipments/{id}` | Delete shipment |
| PATCH | `/shipments/{id}/status` | Update shipment status |

## 🔒 Authentication

Protected routes require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 📄 License

MIT License

Copyright (c) 2026 

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.