# Credenziali e Accesso - Karaoke Manager

## 🔐 Credenziali Admin

**Username**: `admin`
**Password**: `karaoke2025`

⚠️ **IMPORTANTE**: Cambia queste credenziali in produzione!

## 🌐 URL Applicazione

### Sviluppo Locale

- **Frontend (Schermata Pubblica)**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

### Area Admin
_(Da implementare nella prossima sessione)_

## 🔑 Come Ottenere il Token JWT

Per accedere alle API admin, devi prima fare login:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"karaoke2025"}'
```

Risposta:
```json
{
  "success": true,
  "message": "Login effettuato con successo",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "username": "admin",
      "role": "admin"
    }
  }
}
```

## 🛡️ Usare il Token per API Protette

Includi il token nell'header `Authorization`:

```bash
curl http://localhost:3001/api/queue/history \
  -H "Authorization: Bearer IL_TUO_TOKEN_QUI"
```

## 📋 API Endpoints

### Pubblici (Senza Autenticazione)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| GET | `/api/queue` | Visualizza la coda |
| POST | `/api/queue` | Aggiungi cantante alla coda |

### Protetti (Richiedono Token Admin)

| Metodo | Endpoint | Descrizione |
|--------|----------|-------------|
| DELETE | `/api/queue/:id` | Rimuovi cantante dalla coda |
| PUT | `/api/queue/:id/complete` | Segna cantante come completato |
| PUT | `/api/queue/:id/singing` | Segna cantante come "sta cantando" |
| PUT | `/api/queue/reorder` | Riordina la coda |
| GET | `/api/queue/history` | Visualizza storico |
| POST | `/api/queue/reset` | Reset coda |
| POST | `/api/queue/reset-all` | Reset completo (coda + storico) |

## 🔄 Token Scadenza

I token JWT scadono dopo **24 ore**. Dopo la scadenza, devi fare login nuovamente.

## 🚀 Avviare l'Applicazione

### Backend
```bash
cd "D:\Karaoke Manager\backend"
npm run dev
```

### Frontend
```bash
cd "D:\Karaoke Manager\frontend"
npm run dev
```

### Entrambi con Docker
```bash
cd "D:\Karaoke Manager"
docker-compose up
```

---

_Ultimo aggiornamento: 2025-10-28_
