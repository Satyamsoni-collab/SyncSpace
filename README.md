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
