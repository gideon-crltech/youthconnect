# YouthConnect

A web app that helps young people in Namibia find IT jobs, internships and training abroad.

- **Frontend:** HTML, CSS, JavaScript (`*.html`, `css/`, `js/`)
- **Backend:** Python + Flask (`backend/app.py`)
- **Database:** PostgreSQL (`backend/schema.sql`)

## Folder layout

```
youthconnect/
├── index.html        Login page
├── register.html     Create account (2 steps)
├── dashboard.html    Dashboard (needs login)
├── jobs.html         Search / filter opportunities
├── job.html          Opportunity details (job.html?id=...)
├── training.html     Skills & training
├── css/              Stylesheets
├── js/
│   ├── script.js     Registration step buttons (no backend needed)
│   └── api.js        Talks to the backend (login, register, jobs, training)
└── backend/
    ├── app.py            Flask API + serves the pages
    ├── schema.sql        Database tables + demo data
    └── requirements.txt  Python packages
```

## How to run it (about 5 minutes)

You need **Python 3.9+** and **PostgreSQL** installed.

### 1. Create the database

Open a terminal in the `youthconnect/backend` folder.

```bash
psql -U postgres -c "CREATE DATABASE youthconnect;"
psql -U postgres -d youthconnect -f schema.sql
```

(Enter your PostgreSQL password when asked. If `psql` is not found, use
**pgAdmin**: create a database called `youthconnect`, open the Query Tool,
paste in the contents of `schema.sql` and run it.)

### 2. Install the Python packages

```bash
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac / Linux
pip install -r requirements.txt
```

### 3. Tell the app your database password

Replace `YOURPASSWORD` with your PostgreSQL password.

```bash
set DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/youthconnect          # Windows (cmd)
$env:DATABASE_URL="postgresql://postgres:YOURPASSWORD@localhost:5432/youthconnect"       # Windows (PowerShell)
export DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/youthconnect       # Mac / Linux
```

### 4. Start it

```bash
python app.py
```

Now open **http://localhost:5000** in your browser.

> Always open the site through `http://localhost:5000`. Double-clicking the
> `.html` files will not keep you logged in.

## What to try

1. Click **Create an account**, fill in both steps, and you land on the dashboard.
2. Log out, then log in again with the same email and password.
3. Go to **Find Jobs**, use the filters, and click **View Details**.
4. Open **Skills & Training**.

## How the pieces connect

```
Browser pages  ──(js/api.js, fetch)──▶  Flask API (backend/app.py)  ──▶  PostgreSQL
```

| Page action | API endpoint | Database table |
|---|---|---|
| Register | `POST /api/register` | `users`, `user_countries` |
| Log in / out | `POST /api/login`, `/api/logout` | `users` |
| Dashboard welcome name | `GET /api/me` | `users` |
| Job search and cards | `GET /api/jobs?keyword=&country=&category=&type=` | `jobs` |
| Job details | `GET /api/jobs/<slug>` | `jobs` |
| Training cards | `GET /api/training` | `training` |

Passwords are stored hashed, never as plain text.

## Good to know

- The jobs and training rows in `schema.sql` are **demo examples**, not real vacancies.
  To add more, insert rows into the `jobs` table.
- Running `schema.sql` again **erases and recreates** the tables, including accounts.
- Before submitting or deploying, set a real secret key (it signs the login cookie):
  `set SECRET_KEY=some-long-random-text`

## Troubleshooting

| Problem | Fix |
|---|---|
| `password authentication failed` | Wrong password in `DATABASE_URL` |
| `database "youthconnect" does not exist` | Do step 1 again |
| Pages show "Cannot reach the server" | `python app.py` is not running |
| Dashboard sends you back to login | You are not logged in, or you opened the file directly instead of via `localhost:5000` |
| `pip install` fails on psycopg2 | Run `pip install --upgrade pip`, then install again |
