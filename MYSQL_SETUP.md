# MySQL Database Setup Guide

This project now uses **MySQL** with **Prisma ORM** for data persistence.

## Prerequisites

You need a MySQL server running. Choose one of these options:

### Option 1: XAMPP (Recommended for Windows)
1. Download and install [XAMPP](https://www.apachefriends.org/)
2. Start the MySQL module from XAMPP Control Panel
3. MySQL will be available at `localhost:3306`
4. Default credentials: `root` (no password)

### Option 2: MySQL Standalone
1. Download [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)
2. Install and note your root password
3. Start MySQL service

### Option 3: Docker
```powershell
docker run --name mysql-eb -e MYSQL_ROOT_PASSWORD=password -e MYSQL_DATABASE=electricity_billing -p 3306:3306 -d mysql:8
```

---

## Setup Steps

### 1. Configure Database Connection

Edit the `.env` file in the project root:

```env
DATABASE_URL="mysql://root:password@localhost:3306/electricity_billing"
```

**Connection String Format:**
```
mysql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE_NAME]
```

**Examples:**
- XAMPP (no password): `mysql://root@localhost:3306/electricity_billing`
- With password: `mysql://root:MyPass123@localhost:3306/electricity_billing`
- Remote host: `mysql://user:pass@db.example.com:3306/electricity_billing`

### 2. Create Database

Open MySQL command line or phpMyAdmin and create the database:

```sql
CREATE DATABASE electricity_billing;
```

Or using PowerShell:
```powershell
mysql -u root -p -e "CREATE DATABASE electricity_billing;"
```

### 3. Generate Prisma Client

```powershell
npm run db:generate
```

This creates the Prisma Client based on your schema.

### 4. Push Schema to Database

```powershell
npm run db:push
```

This creates all tables in MySQL without migration files (quick for development).

**OR** use migrations (recommended for production):

```powershell
npm run db:migrate
```

### 5. Seed Sample Data (Optional)

```powershell
npm run db:seed
```

This creates:
- 5 sample consumers
- 15 bills (3 months for each consumer)
- Default settings (cost per unit: ₹5.00)

---

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema to database (no migrations) |
| `npm run db:migrate` | Create and apply migration |
| `npm run db:studio` | Open Prisma Studio (visual database browser) |
| `npm run db:seed` | Seed database with sample data |
| `npm run server` | Start API server |
| `npm run dev:full` | Run both frontend and backend |

---

## Verify Setup

1. **Check database connection:**
```powershell
npm run server
```
Then visit: http://localhost:3001/api/health

2. **Browse database visually:**
```powershell
npm run db:studio
```
Opens Prisma Studio at http://localhost:5555

3. **Test API:**
```powershell
# Get all data
curl http://localhost:3001/api/state

# Health check
curl http://localhost:3001/api/health
```

---

## Troubleshooting

### Error: "Can't reach database server"
- Ensure MySQL is running
- Check connection string in `.env`
- Verify port (default 3306)
- Check firewall settings

### Error: "Access denied for user"
- Verify username and password in `.env`
- Check MySQL user permissions:
```sql
GRANT ALL PRIVILEGES ON electricity_billing.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Unknown database"
- Create the database first: `CREATE DATABASE electricity_billing;`

### Port 3306 already in use
- Another MySQL instance is running
- Change port in `.env` or stop the other instance

---

## Schema Overview

### Tables

**Consumer**
- `id` - Auto-increment primary key
- `consumerID` - Unique consumer identifier
- `name` - Consumer name
- `address` - Address (min 7 chars)
- `mobile_no` - 10-digit mobile number
- `createdAt` - Record creation timestamp

**Bill**
- `id` - Auto-increment primary key
- `consumerID` - Links to Consumer
- `month` - Bill month (1-12)
- `year` - Bill year
- `units_consumed` - Electricity units
- `amt` - Total amount
- `createdAt` - Record creation timestamp
- **Unique constraint**: One bill per consumer per month/year

**Settings**
- `id` - Auto-increment primary key
- `key` - Setting name (e.g., 'cost_per_unit')
- `value` - Setting value
- `updatedAt` - Last update timestamp

---

## Migration vs Push

**`db:push`** (Development)
- Quick prototyping
- No migration history
- Resets data if schema conflicts

**`db:migrate`** (Production)
- Creates migration files
- Version control friendly
- Safe for production deployments

---

## Next Steps

1. Configure `.env` with your MySQL credentials
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Run `npm run db:seed` (optional)
5. Start the server: `npm run dev:full`

Your app is now using MySQL! 🎉
