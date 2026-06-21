# Kindshare 3.0

A full-stack ecommerce web application with a React frontend and a Node.js/Express backend.

## Repository

- **GitHub**: https://github.com/LeiaDing/Kindshare3.0
- **Default branch**: `main`

## Tech Stack

### Frontend
- React 18
- React Router DOM
- Redux Toolkit / React Redux
- MDBReact
- Chart.js via `react-chartjs-2`
- CRA (`react-scripts`)

### Backend
- Node.js (ES Modules)
- Express
- MongoDB + Mongoose
- JWT Authentication
- Stripe
- Cloudinary
- Nodemailer

## Project Structure

```text
Kindshare3.0/
├── backend/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── seeder/
│   └── utils/
├── frontend/
│   ├── build/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── README.md
├── package.json
└── package-lock.json
```

## Prerequisites

Make sure you have installed:

- Node.js (LTS recommended)
- npm
- MongoDB (local or cloud instance)

## Installation

Clone the repository and install dependencies for both root (backend) and frontend.

```bash
git clone https://github.com/LeiaDing/Kindshare3.0.git
cd Kindshare3.0

# Install backend dependencies (root)
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

## Environment Variables

Create a `.env` file in the project root (same level as `backend/`) and configure values based on your environment.

Typical variables for this stack include:

```env
NODE_ENV=DEVELOPMENT
PORT=4000
DB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_TIME=<jwt_expiration>
COOKIE_EXPIRES_TIME=<cookie_days>
SMTP_HOST=<smtp_host>
SMTP_PORT=<smtp_port>
SMTP_EMAIL=<smtp_email>
SMTP_PASSWORD=<smtp_password>
SMTP_FROM_EMAIL=<from_email>
SMTP_FROM_NAME=<from_name>
CLOUDINARY_CLOUD_NAME=<cloudinary_cloud_name>
CLOUDINARY_API_KEY=<cloudinary_api_key>
CLOUDINARY_API_SECRET=<cloudinary_api_secret>
STRIPE_SECRET_KEY=<stripe_secret_key>
STRIPE_API_KEY=<stripe_publishable_key>
```

> Notes:
> - The frontend is configured with proxy `http://localhost:4000` in `frontend/package.json`.
> - Keep all secrets out of source control.

## Running the App

### 1) Start backend (root)

```bash
npm run dev
```

Backend scripts from root `package.json`:
- `npm start` → run backend with Node
- `npm run dev` → run backend with Nodemon (`NODE_ENV=DEVELOPMENT`)
- `npm run prod` → run backend with Nodemon (`NODE_ENV=PRODUCTION`)
- `npm run seeder` → run database seeder

### 2) Start frontend

In another terminal:

```bash
cd frontend
npm start
```

Frontend scripts:
- `npm start`
- `npm run build`
- `npm test`

## Build

To create a production build for frontend:

```bash
cd frontend
npm run build
```

## API + Client Development Workflow

- Backend runs on: `http://localhost:4000`
- Frontend runs on: `http://localhost:3000`
- Frontend API calls are proxied to backend via CRA proxy setting.

## Seeding Data

To run the seeder from the project root:

```bash
npm run seeder
```

Make sure your database connection variables are configured first.

## License

This project is currently licensed as **ISC** according to `package.json`.

---


