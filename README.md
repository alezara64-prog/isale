# Karaoke Manager

Webapp per gestire attività di Karaoke, con architettura cloud-ready.

## Struttura del Progetto

```
Karaoke Manager/
├── backend/          # API Node.js + Express
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── middleware/
│   │   └── config/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/         # React + Vite
│   ├── src/
│   │   ├── config/
│   │   └── ...
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── database/         # Schema e migrations
├── docker-compose.yml
└── README.md
```

## Requisiti

- Node.js 18+
- npm o yarn
- Docker e Docker Compose (opzionale, per deployment)

## Avvio in Sviluppo Locale

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Il backend sarà disponibile su `http://localhost:3001`

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Il frontend sarà disponibile su `http://localhost:3000`

## Deployment con Docker

### Build e avvio di tutti i servizi

```bash
docker-compose up -d
```

### Solo build

```bash
docker-compose build
```

### Stop dei servizi

```bash
docker-compose down
```

## Deployment Cloud

Questo progetto è configurato per essere facilmente deployato su:

- **AWS**: EC2 + RDS o ECS + RDS
- **Azure**: App Service + Azure SQL
- **Google Cloud**: Cloud Run + Cloud SQL
- **Heroku**: Web Dynos + Heroku Postgres
- **Vercel/Netlify**: Frontend statico + Backend su servizio separato

### Variabili d'Ambiente per Produzione

Backend:
- `PORT`: Porta del server (default: 3001)
- `NODE_ENV`: production
- Database credentials (da configurare)

Frontend:
- `VITE_API_URL`: URL del backend API

## API Endpoints

### Health Check

```
GET /health
```

Risposta:
```json
{
  "status": "OK",
  "timestamp": "2025-10-28T..."
}
```

## Sviluppo Futuro

- [ ] Autenticazione e autorizzazione (JWT)
- [ ] Database (PostgreSQL o MongoDB)
- [ ] CRUD per gestione brani karaoke
- [ ] Sistema di prenotazioni
- [ ] Gestione eventi
- [ ] Dashboard analytics
- [ ] CI/CD pipeline

## Licenza

Proprietario
