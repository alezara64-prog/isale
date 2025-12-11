# TODO - Karaoke Manager

## 🚧 In Corso

_(Nessuna task in corso - pronto per la prossima sessione)_

## ✅ Completato (Sessione 1 - 2025-10-28)

- [x] Spostare la cartella in D:\Karaoke Manager
- [x] Inizializzare progetto Node.js + React
- [x] Configurare struttura backend (Express + API)
- [x] Configurare frontend (React + Vite)
- [x] Creare Dockerfile per backend e frontend
- [x] Creare docker-compose.yml per deployment
- [x] Progettare struttura dati per la coda
- [x] Creare modello Queue (queue.model.js)
- [x] Creare controller Queue (queue.controller.js)
- [x] Creare route API per la coda
- [x] Integrare le route nel server
- [x] Installare dipendenze per autenticazione (JWT + bcryptjs)
- [x] Implementare autenticazione admin con JWT
- [x] Creare modello Admin (admin.model.js)
- [x] Creare controller Auth (auth.controller.js)
- [x] Creare middleware di protezione route admin (auth.middleware.js)
- [x] Proteggere tutte le route admin
- [x] Aggiornare .env.example con JWT_SECRET e credenziali
- [x] Creare schermata pubblica cantanti (PublicQueue.jsx)
- [x] Creare form aggiunta alla coda
- [x] Implementare visualizzazione coda in tempo reale (auto-refresh 5s)
- [x] Creare documentazione completa (START_HERE, PROGRESS, CREDENTIALS)
- [x] Testare backend e frontend

## 📋 Da Fare (Priorità MASSIMA - Prossima Sessione)

### 1️⃣ Schermata Login Admin
- [ ] Creare componente React LoginPage.jsx
- [ ] Implementare form di login (username + password)
- [ ] Gestire autenticazione con JWT
- [ ] Salvare token in localStorage
- [ ] Redirect a dashboard dopo login
- [ ] Gestione errori login

### 2️⃣ Aggiornare Modello Dati per Nuovi Campi
- [ ] **Aggiungere campo "artist"** (interprete originale canzone) - OBBLIGATORIO
- [ ] **Aggiungere campo "tonality"** (valore da -6 a +6, default: 0) - OBBLIGATORIO
- [ ] Aggiornare queue.model.js con nuovi campi
- [ ] Aggiornare queue.controller.js per validare nuovi campi
- [ ] Assicurarsi che TUTTI i campi siano obbligatori prima dell'invio

### 3️⃣ Aggiornare Form Pubblico con Nuovi Campi
- [ ] Aggiungere input "Interprete Originale" (artist)
- [ ] Aggiungere select/slider per "Tonalità" (-6 a +6, default 0)
- [ ] Validazione obbligatoria per tutti i campi
- [ ] Aggiornare PublicQueue.jsx
- [ ] Aggiornare stili CSS

### 4️⃣ Implementare Database Locale
- [ ] **Scegliere database**: SQLite (consigliato per semplicità) o PostgreSQL
- [ ] Installare dipendenze (sqlite3 o pg)
- [ ] Creare schema database nella cartella database/
- [ ] Creare tabelle: queue, queue_history, (admin?)
- [ ] Implementare connessione database in backend/src/config/database.js
- [ ] Migrare queue.model.js da memoria a database
- [ ] Testare persistenza dati dopo riavvio server
- [ ] Aggiornare documentazione con setup database

### 5️⃣ Dashboard Admin
- [ ] Creare componente React AdminDashboard.jsx
- [ ] Visualizzare coda completa con tutti i nuovi campi
- [ ] Pulsante "Rimuovi" per ogni cantante
- [ ] Pulsante "Sta cantando" per segnare cantante corrente
- [ ] Pulsante "Completato" per spostare in storico
- [ ] Pulsante "Reset Coda"
- [ ] Visualizzare storico cantanti
- [ ] Proteggere route con autenticazione

## 📋 Da Fare (Priorità Alta)

- [ ] Implementare routing con react-router-dom (/ = pubblica, /admin = login, /admin/dashboard)
- [ ] Aggiungere notifiche/toast per feedback utente
- [ ] Implementare WebSocket per aggiornamenti real-time (alternativa a polling)
- [ ] Aggiungere paginazione per storico cantanti
- [ ] Aggiungere ricerca e filtri per canzoni nella dashboard admin

## 📋 Da Fare (Priorità Media)

- [ ] Creare statistiche (cantanti più attivi, canzoni più cantate, tonalità più usate)
- [ ] Aggiungere possibilità di modificare un cantante già in coda
- [ ] Implementare drag-and-drop per riordinare la coda
- [ ] Aggiungere esportazione storico in CSV/PDF
- [ ] Implementare backup automatico database
- [ ] Aggiungere campo note/commenti per ogni cantante

## 📋 Da Fare (Priorità Bassa / Funzionalità Future)

- [ ] Aggiungere supporto per più eventi/serate
- [ ] Implementare sistema di prenotazioni anticipate
- [ ] Aggiungere catalogo completo canzoni karaoke
- [ ] Implementare QR code per accesso rapido alla coda
- [ ] Aggiungere tema dark/light
- [ ] Implementare export dati (CSV, PDF)
- [ ] Aggiungere dashboard analytics avanzata
- [ ] Implementare multi-lingua (italiano/inglese)
- [ ] Creare app mobile (React Native)
- [ ] Implementare sistema di votazione per canzoni

## 🐛 Bug da Risolvere

_(Nessun bug conosciuto al momento)_

## 📝 Note Tecniche

- Backend: Node.js + Express su porta 3001
- Frontend: React + Vite su porta 3000
- **Dati**: Attualmente in memoria → DA MIGRARE A DATABASE LOCALE (SQLite consigliato)
- Autenticazione: JWT tokens (scadenza 24h)
- Deploy: Docker + Docker Compose (cloud-ready)

## 🎯 Nuove Specifiche Modello Dati

### Campi Obbligatori per Ogni Cantante in Coda:
1. **singerName** (string) - Nome del cantante (chi canterà)
2. **songTitle** (string) - Titolo della canzone
3. **artist** (string) - NUOVO: Interprete originale della canzone
4. **tonality** (number) - NUOVO: Tonalità da -6 a +6 (default: 0)

### Validazioni:
- Tutti i campi sono OBBLIGATORI
- tonality deve essere un numero intero tra -6 e +6
- Tutti i campi stringa devono avere lunghezza minima > 0 (dopo trim)

## 🔄 Aggiornato il

2025-10-28 21:35
