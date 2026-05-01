# Team Task Manager

A full-stack web application for managing team-based projects and tasks with role-based access control.

## Live Application

(Will be added after deployment)

## Overview

This application allows users to create projects, manage team members, assign tasks, and track progress through a centralized dashboard. The system enforces role-based permissions to ensure controlled access to project operations.

## Key Features

* JWT-based authentication (signup & login)
* Project creation and team collaboration
* Role-based access control:

  * Admin: manage members and all tasks
  * Member: update assigned tasks
* Task management:

  * Create, assign, and update tasks
  * Track task status (TODO, IN_PROGRESS, DONE)
* Dashboard view:

  * Displays assigned tasks
  * Highlights overdue tasks based on due date

## Tech Stack

* Frontend: React
* Backend: Node.js, Express
* Database: PostgreSQL
* ORM: Prisma
* Authentication: JSON Web Tokens (JWT)

## Architecture

* RESTful API design
* Backend handles authentication, authorization, and business logic
* Prisma ORM used for database schema and queries
* Frontend consumes APIs and manages UI state

## Project Structure

```id="u0xm7o"
backend/
  prisma/        # database schema
  src/
    middleware/  # authentication & authorization
    routes/      # auth, projects, tasks, dashboard
  index.js

frontend/
  src/
    pages/       # Login, Signup, Dashboard, ProjectPage
    components/  # reusable UI components
  App.jsx
```

## Local Setup

### Backend

```bash id="cx4h8m"
cd backend
npm install
cp .env.example .env
```

Configure environment variables:

```id="0a6gwb"
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
```

```bash id="8dlfx9"
npx prisma db push
npm run dev
```

---

### Frontend

```bash id="9opx6u"
cd frontend
npm install
cp .env.example .env
```

```id="6h8y27"
REACT_APP_API_URL=http://localhost:5000/api
```

```bash id="zwljtt"
npm start
```

---

## Deployment

The application is deployed on Railway:

* Backend deployed as a Node.js service
* PostgreSQL database provisioned via Railway
* Frontend deployed as a separate service and connected via API URL

## Implementation Notes

* Passwords are hashed using bcrypt before storage
* JWT tokens are used for authentication and passed via Authorization headers
* Middleware is used to protect routes and enforce access control
* Overdue tasks are determined by comparing due date with current date when status is not DONE
