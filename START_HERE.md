# 🚀 START HERE - Guida per Riprendere il Progetto

## 📖 Prima di Iniziare una Nuova Sessione

**IMPORTANTE**: Prima di scrivere qualsiasi codice, LEGGI SEMPRE questi documenti nell'ordine indicato:

1. **START_HERE.md** (questo file) - Per capire da dove iniziare
2. **README.md** - Panoramica generale del progetto
3. **PROGRESS.md** - Cosa è stato fatto finora
4. **TODO.md** - Cosa resta da fare (IMPORTANTE: contiene priorità!)
5. **SPECS.md** - Specifiche tecniche dettagliate del modello dati
6. **CREDENTIALS.md** - Credenziali e informazioni di accesso

## ⚡ Quick Start

### Avviare i Server

```bash
# Backend (terminale 1)
cd "D:\Karaoke Manager\backend"
npm run dev

# Frontend (terminale 2)
cd "D:\Karaoke Manager\frontend"
npm run dev
```

### Verificare che Funzioni

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- Health Check: http://localhost:3001/health

## 🗂️ Struttura del Progetto

```
D:\Karaoke Manager/
├── 📄 START_HERE.md         ← Leggi per primo!
├── 📄 README.md             ← Panoramica progetto
├── 📄 PROGRESS.md           ← Log di tutto ciò che è stato fatto
├── 📄 TODO.md               ← Task da completare
├── 📄 CREDENTIALS.md        ← Credenziali admin e API
├── 📄 docker-compose.yml    ← Per deployment con Docker
│
├── 📁 backend/              ← API Node.js + Express
│   ├── src/
│   │   ├── server.js                  ← Entry point del server
│   │   ├── models/
│   │   │   ├── queue.model.js         ← Gestione coda (in memoria)
│   │   │   └── admin.model.js         ← Gestione autenticazione admin
│   │   ├── controllers/
│   │   │   ├── queue.controller.js    ← Logic per coda
│   │   │   └── auth.controller.js     ← Logic per login
│   │   ├── routes/
│   │   │   ├── queue.routes.js        ← Endpoint /api/queue
│   │   │   ├── auth.routes.js         ← Endpoint /api/auth
│   │   │   └── karaoke.routes.js      ← Endpoint /api/karaoke (esempio)
│   │   ├── middleware/
│   │   │   └── auth.middleware.js     ← Protezione route admin
│   │   └── config/
│   ├── package.json
│   └── .env.example               ← Template per variabili ambiente
│
├── 📁 frontend/             ← React + Vite
│   ├── src/
│   │   ├── App.jsx                    ← Componente principale
│   │   ├── pages/
│   │   │   ├── PublicQueue.jsx        ← Schermata pubblica cantanti ✅
│   │   │   └── PublicQueue.css        ← Stili schermata pubblica
│   │   ├── config/
│   │   │   └── api.js                 ← Configurazione axios
│   │   └── components/
│   │       └── SongList.jsx           ← Esempio componente (non usato)
│   ├── package.json
│   └── vite.config.js             ← Config Vite + proxy
│
└── 📁 database/             ← (Vuoto - da implementare in futuro)
```

## 🎯 Stato Attuale del Progetto

### ✅ Implementato

- [x] Backend API completo con Express
- [x] Sistema di gestione coda (in memoria)
- [x] Autenticazione admin con JWT
- [x] Middleware di protezione per route admin
- [x] Frontend React con Vite
- [x] Schermata pubblica per i cantanti (completa e funzionante)
- [x] Configurazione Docker per deployment
- [x] Auto-refresh coda ogni 5 secondi nel frontend

### 🔄 In Progress

- [ ] Area admin per gestire la coda (dashboard)

### 📋 Prossimi Step

1. Creare pagina di login per admin
2. Creare dashboard admin per gestione coda
3. Implementare routing (react-router-dom)
4. Aggiungere WebSocket per aggiornamenti real-time
5. Migrare da memoria a database (SQLite o PostgreSQL)

## 🔍 Come Esplorare il Codice

### Backend - Flusso Richiesta

```
Client Request
    ↓
server.js (Express app)
    ↓
routes/*.routes.js (definisce endpoint)
    ↓
middleware/auth.middleware.js (se protetto)
    ↓
controllers/*.controller.js (logica business)
    ↓
models/*.model.js (gestione dati)
    ↓
Response al Client
```

### Frontend - Flusso Componente

```
App.jsx
    ↓
pages/PublicQueue.jsx
    ↓
config/api.js (chiamate HTTP)
    ↓
Backend API
```

## 📝 Come Aggiungere Nuove Funzionalità

### Backend

1. **Modello**: Creare/modificare file in `backend/src/models/`
2. **Controller**: Creare logica in `backend/src/controllers/`
3. **Route**: Definire endpoint in `backend/src/routes/`
4. **Server**: Importare route in `backend/src/server.js`

### Frontend

1. **Componente/Pagina**: Creare in `frontend/src/pages/` o `frontend/src/components/`
2. **Styling**: Creare file CSS corrispondente
3. **Routing**: Aggiungere in `App.jsx` (per ora semplice, poi con react-router)
4. **API Call**: Usare `api` da `frontend/src/config/api.js`

## 🐛 Troubleshooting

### Il server non si avvia

1. Verifica che Node.js sia installato: `node --version`
2. Verifica dipendenze: `npm install` nella cartella backend/frontend
3. Controlla le porte: 3000 e 3001 devono essere libere

### Errore CORS

- Il backend ha già CORS configurato
- Il frontend usa proxy in `vite.config.js`

### Token non valido

- Verifica che il token non sia scaduto (24h)
- Ri-fai login: `POST /api/auth/login`

## 🔐 Sicurezza

- ⚠️ Password admin hardcoded nel codice (per sviluppo)
- ⚠️ JWT_SECRET di default (cambiare in produzione!)
- ⚠️ Dati in memoria (si perdono al riavvio)

## 📊 Metriche Progetto

- **Completamento**: ~40%
- **File creati**: 30+
- **Linee di codice**: ~1500+
- **Endpoint API**: 12

## 🔄 Procedura Standard per Aggiornare la Documentazione

**Dopo ogni modifica significativa**:

1. Aggiorna **PROGRESS.md** con cosa è stato fatto
2. Aggiorna **TODO.md** segnando task completati e aggiungendo nuovi
3. Se aggiungi credenziali/endpoint, aggiorna **CREDENTIALS.md**
4. Se cambi struttura, aggiorna **README.md**
5. Aggiorna questo file (**START_HERE.md**) se cambia il flusso di lavoro

## 🎓 Concetti Chiave

### API RESTful
- `GET` = Leggere dati
- `POST` = Creare dati
- `PUT` = Modificare dati
- `DELETE` = Eliminare dati

### JWT (JSON Web Token)
- Token firmato per autenticazione
- Include: username, role, timestamp
- Scade dopo 24 ore
- Inviato nell'header: `Authorization: Bearer TOKEN`

### Middleware
- Funzioni che si eseguono prima dei controller
- Es: `authenticateAdmin` controlla il token prima di permettere accesso

### Stato (State Management)
- `useState` in React per dati locali
- `useEffect` per side effects (es: fetch dati)

## 📞 Contatti & Risorse

- Documentazione Express: https://expressjs.com/
- Documentazione React: https://react.dev/
- Documentazione Vite: https://vitejs.dev/
- JWT.io: https://jwt.io/

---

**🎉 Sei pronto! Buon lavoro sul progetto Karaoke Manager!**

_Ultimo aggiornamento: 2025-10-28_
