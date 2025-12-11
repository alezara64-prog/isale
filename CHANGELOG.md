# Changelog - Karaoke Manager

Tutte le modifiche importanti al progetto saranno documentate in questo file.

---

## [Unreleased] - Prossima Sessione

### Da Implementare

#### Nuovi Campi Modello Dati
- **artist** (string): Interprete originale della canzone - OBBLIGATORIO
- **tonality** (number): Valore da -6 a +6, default 0 - OBBLIGATORIO

#### Funzionalità Principali
- Aggiornare form pubblico con nuovi campi
- Database locale SQLite per persistenza dati
- Validazione obbligatoria tutti i campi del form

#### Dettagli Tecnici
- Tutti i campi del form devono essere compilati prima dell'invio
- La tonalità deve essere un intero tra -6 e +6 (inclusi)
- Database deve essere creato nella cartella `database/`
- Testare persistenza dati dopo riavvio server

---

## [0.3.0] - 2025-10-28 (Sessione 2)

### Aggiunte

#### Area Admin Completa
- Pagina login admin (`AdminLogin.jsx`)
  - Form login con validazione
  - Gestione JWT e localStorage
  - Design moderno con gradient
- Dashboard admin (`AdminDashboard.jsx`)
  - Statistiche real-time (4 card)
  - Gestione coda completa
  - Visualizzazione cantante corrente
  - Tab coda/storico
  - Pulsanti azioni (rimuovi, completato, sta cantando)
  - Reset coda e reset totale
  - Auto-refresh ogni 3 secondi
- Routing con react-router-dom
  - `/` → Schermata pubblica
  - `/admin/login` → Login
  - `/admin/dashboard` → Dashboard
- Link "Area Admin" in schermata pubblica
- Link "Vista Pubblica" in dashboard

### Testato

- ✅ Login funzionante
- ✅ Protezione route con JWT
- ✅ Tutte le azioni admin (rimuovi, completa, reset)
- ✅ Auto-refresh dashboard
- ✅ Routing tra pagine

---

## [0.2.0] - 2025-10-28 (Sessione 1)

### Aggiunte

#### Documentazione Completa
- **START_HERE.md**: Guida onboarding per sessioni future
- **PROGRESS.md**: Log dettagliato di tutti i progressi
- **TODO.md**: Task list organizzata per priorità
- **CREDENTIALS.md**: Info credenziali e API endpoints
- **SPECS.md**: Specifiche tecniche modello dati
- **CHANGELOG.md**: Questo file

#### Backend
- Autenticazione admin completa con JWT
- Modello Admin (`models/admin.model.js`)
- Controller Auth (`controllers/auth.controller.js`)
- Middleware Auth (`middleware/auth.middleware.js`)
- Route Auth (`routes/auth.routes.js`)
- Protezione route admin con token JWT
- Hash password con bcrypt
- Token valido 24 ore

#### Frontend
- Schermata pubblica cantanti completa (`pages/PublicQueue.jsx`)
- Form aggiunta alla coda
- Visualizzazione coda in tempo reale
- Auto-refresh ogni 5 secondi
- Design moderno e responsive
- Gradient viola/blu
- Messaggi successo/errore

### Testato

- ✅ Login admin con credenziali corrette
- ✅ Protezione route admin con JWT
- ✅ Aggiunta cantanti alla coda (API)
- ✅ Visualizzazione coda nel frontend
- ✅ Auto-refresh funzionante
- ✅ Form validazione base

---

## [0.1.0] - 2025-10-28 (Inizio Sessione 1)

### Aggiunte

#### Setup Iniziale
- Creata struttura progetto in `D:\Karaoke Manager`
- Inizializzato backend Node.js + Express
- Inizializzato frontend React + Vite
- Configurato CORS e proxy

#### Backend
- Server Express (`src/server.js`)
- Modello Queue (`models/queue.model.js`) - dati in memoria
- Controller Queue (`controllers/queue.controller.js`)
- Route Queue (`routes/queue.routes.js`)
- Route Karaoke esempio (`routes/karaoke.routes.js`)
- Health check endpoint

#### API Endpoints
- `GET /health` - Health check
- `GET /api/queue` - Visualizza coda (pubblico)
- `POST /api/queue` - Aggiungi cantante (pubblico)
- `DELETE /api/queue/:id` - Rimuovi cantante (admin)
- `PUT /api/queue/:id/complete` - Completa cantante (admin)
- `PUT /api/queue/:id/singing` - Segna come "cantando" (admin)
- `PUT /api/queue/reorder` - Riordina coda (admin)
- `GET /api/queue/history` - Storico (admin)
- `POST /api/queue/reset` - Reset coda (admin)
- `POST /api/queue/reset-all` - Reset totale (admin)

#### Frontend
- Configurazione Vite con proxy
- Configurazione axios (`config/api.js`)
- Componente esempio SongList

#### Deployment
- Dockerfile backend (Node Alpine)
- Dockerfile frontend (build + Nginx)
- docker-compose.yml
- nginx.conf per SPA routing
- .dockerignore
- .gitignore

#### Documentazione
- README.md base

### Dipendenze Installate

#### Backend
- express 5.1.0
- cors 2.8.5
- dotenv 17.2.3
- jsonwebtoken 9.0.2
- bcryptjs 3.0.2
- nodemon 3.1.10 (dev)

#### Frontend
- react 18.x
- vite 7.1.12
- axios (latest)

---

## Formato Versioning

Il progetto segue [Semantic Versioning](https://semver.org/):
- **MAJOR**: Cambiamenti incompatibili con versioni precedenti
- **MINOR**: Nuove funzionalità retrocompatibili
- **PATCH**: Bug fix retrocompatibili

---

_Ultimo aggiornamento: 2025-10-28 21:40 UTC_
