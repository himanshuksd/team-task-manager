# Team Task Manager

This is my college project — a full stack web app for managing tasks in a team.

Built with React, Node/Express, Prisma ORM and PostgreSQL.

## Features

- signup and login with JWT auth
- create projects and invite team members
- admins can add members, members can only view/update tasks
- create tasks with title, description, due date, and assign to someone
- update task status (TODO, IN_PROGRESS, DONE)
- dashboard shows your assigned tasks and highlights overdue ones

## Folder structure

```
/backend
  /prisma       - database schema
  /src
    /middleware - jwt auth check
    /routes     - auth, projects, tasks, dashboard
  index.js
  .env.example

/frontend
  /src
    /pages      - Login, Signup, Dashboard, ProjectPage
    /components - Navbar
  App.jsx
  .env.example
```

## How to run locally

### 1. Setup the backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and set your postgres database URL and a JWT secret key.

Then push the schema:

```bash
npx prisma db push
```

Start the server:

```bash
npm run dev
```

Server runs on http://localhost:5000

### 2. Setup the frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Make sure `REACT_APP_API_URL` points to the backend.

```bash
npm start
```

Frontend runs on http://localhost:3000

## Deploy on Railway

1. Create a Railway project
2. Add a postgres database and copy the connection string
3. Deploy the backend folder, add env vars (DATABASE_URL, JWT_SECRET)
4. Deploy the frontend folder, set REACT_APP_API_URL to the backend URL
5. Run `npx prisma db push` once from the backend service shell

## Notes

- Used Tailwind via CDN in index.html to keep setup simple
- Roles: Admin can add members and delete any task. Members can only update status or delete their own tasks.
- Overdue = task has a due date that has passed and is not DONE yet
