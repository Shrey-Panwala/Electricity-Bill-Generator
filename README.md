# Electricity Billing Portal

A full-stack web application for managing electricity bills with React frontend, Express backend, and MySQL database via Prisma ORM.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Backend**: Express.js + Node.js
- **Database**: MySQL + Prisma ORM
- **C++ Console App**: Original billing logic (included)

## Features
- 📊 Dashboard with KPIs (consumers, bills, revenue)
- 👥 Consumer management with validation
- 📄 Bill creation and tracking
- 💰 Configurable cost per unit
- 📈 Historical billing data (previous 3 months)
- 🖨️ Print/PDF export for bills
- ✅ Input validation matching C++ logic
- 🗄️ MySQL database persistence

---

## Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL server (XAMPP, standalone, or Docker)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Setup MySQL Database
See [MYSQL_SETUP.md](MYSQL_SETUP.md) for detailed instructions.

**Quick setup:**
```powershell
# Edit .env with your MySQL credentials
# DATABASE_URL="mysql://root:password@localhost:3306/electricity_billing"

# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:push

# Seed sample data (optional)
npm run db:seed
```

### 3. Run the Application
```powershell
# Run both frontend and backend
npm run dev:full
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- API Health: http://localhost:3001/api/health

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend only (Vite) |
| `npm run server` | Start backend only (Express) |
| `npm run dev:full` | Run both frontend & backend |
| `npm run build` | Build for production |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Create migration |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed sample data |

---

## Project Structure
```
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── lib/               # Utilities & API client
│   └── App.tsx            # Main app component
├── server/
│   └── prisma-server.js   # Express API with Prisma
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Sample data seeder
├── Electricity_bill.cpp   # Original C++ program
└── .env                   # Database configuration
```

---

## C++ Console Program

The original C++ program is included. Compile and run:

```powershell
g++ Electricity_bill.cpp -o Electricity_bill.exe
./Electricity_bill.exe
```

**Features:**
- Add consumers with validation
- Create bills with duplicate prevention
- Generate detailed bills with history
- Configurable cost per unit

---

## Validation Rules

Both web and C++ versions enforce:
- **Mobile**: Exactly 10 digits
- **Address**: Minimum 7 characters
- **Month**: 1-12
- **Year**: 2000-2100
- **Consumer ID**: Positive integer, unique
- **Units**: Positive number
- **Duplicate Prevention**: One bill per consumer per month/year

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/state` | Get all consumers and bills |
| POST | `/api/consumer` | Add new consumer |
| DELETE | `/api/consumer/:id` | Delete consumer |
| POST | `/api/bill` | Create new bill |
| DELETE | `/api/bill/:id/:year/:month` | Delete bill |
| GET | `/api/settings/cost-per-unit` | Get cost setting |
| PUT | `/api/settings/cost-per-unit` | Update cost setting |
| GET | `/api/health` | Health check |

---

## Database Schema

**Consumer Table:**
- Unique consumer ID
- Name, address, mobile (validated)
- One-to-many relationship with bills

**Bill Table:**
- Links to consumer (cascade delete)
- Month, year, units consumed, amount
- Unique constraint on consumer+month+year

**Settings Table:**
- Key-value store for configuration
- Currently stores: cost_per_unit

---

## Development Notes

- Frontend uses localStorage as fallback if API unavailable
- Backend validates all inputs matching C++ logic
- Prisma handles database operations with type safety
- Cascading deletes: removing consumer removes their bills
- Cost per unit stored in database (Settings table)

---

## Troubleshooting

**Database connection issues?**
- Check MySQL is running
- Verify `.env` connection string
- See [MYSQL_SETUP.md](MYSQL_SETUP.md) for details

**Port conflicts?**
- Frontend (5173) or Backend (3001) ports in use?
- Change in `vite.config.ts` or server file

**Prisma errors?**
- Run `npm run db:generate` after schema changes
- Run `npm run db:push` to sync database

---

## License
Educational project for DS Innovative Assignment

## Features
- Add consumers with validations
- List consumers (sorted by ID)
- Add bills; amount auto-calculated
- Generate bill with previous 3 months summary
- Adjustable cost-per-unit
- Data persisted in browser localStorage

## Quick Start (Frontend Only)

```bash
# From the project root
npm install
npm run dev
```

Open the shown local URL to use the app.

## Full-Stack (API + Frontend)

This repo now includes a simple Express API with file-based persistence.

### Run both servers

```bash
npm install
npm run dev:full
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

Vite proxies `/api/*` to the local API automatically.

### API Overview
- `GET /api/state` – full app state
- `POST /api/consumer` – add consumer
- `DELETE /api/consumer/:id` – remove consumer (+ bills)
- `POST /api/bill` – add bill (amount auto-calculated)
- `DELETE /api/bill/:consumerID/:year/:month` – remove bill
- `GET /api/consumer/:id` – fetch consumer
- `GET /api/bill/:consumerID/:year/:month` – fetch bill
- `GET /api/bills/previous/:consumerID/:year/:month` – last 3 bills (latest-first)
- `PATCH /api/settings/cost-per-unit` – update cost per unit

### Deploying to GitHub Pages

Build the frontend and publish the `dist/` folder to Pages:

```bash
npm run build
# Upload dist/ to GitHub Pages (manual or using an action)
```

Note: GitHub Pages hosts static files only. For the API, deploy separately (e.g., Render/Railway/Vercel) and set Vite `server.proxy` or use env-based `base` and API URL config.

## Notes
- Logic ported from `Electricity_bill.cpp` and adapted for the web.
- For server-backed storage (e.g., database), we can add an API later.
