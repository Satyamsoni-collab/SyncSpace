# SyncSpace - Backend & Database Architecture

## Overview
SyncSpace backend services providing real-time collaboration persistence, document management, and JWT-secured REST APIs.

---

## Authentication Endpoints

### 1. Register User
* **Endpoint:** `POST /api/auth/register`
* **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }

## Backend Health Check

SyncSpace provides a backend health-check endpoint to verify that the server is running and the MongoDB connection is available.

### Endpoint

```text
GET /api/health
