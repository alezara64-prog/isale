# Specifiche Tecniche - Karaoke Manager

## 📊 Modello Dati Cantante

### Struttura Completa

```javascript
{
  id: Number,              // Auto-incrementale
  singerName: String,      // Nome del cantante (chi canterà)
  songTitle: String,       // Titolo della canzone
  artist: String,          // Interprete originale della canzone
  tonality: Number,        // Tonalità (-6 a +6, default: 0)
  addedAt: ISO Date,       // Timestamp aggiunta
  status: String,          // 'waiting' | 'singing' | 'completed'
  completedAt: ISO Date    // Timestamp completamento (opzionale)
}
```

### Campi Obbligatori

| Campo | Tipo | Obbligatorio | Validazione | Default |
|-------|------|--------------|-------------|---------|
| singerName | String | ✅ Sì | lunghezza > 0 (dopo trim), max 50 caratteri | - |
| songTitle | String | ✅ Sì | lunghezza > 0 (dopo trim), max 100 caratteri | - |
| artist | String | ✅ Sì | lunghezza > 0 (dopo trim), max 50 caratteri | - |
| tonality | Number | ✅ Sì | Intero tra -6 e +6 (inclusi) | 0 |
| status | String | Auto | 'waiting' \| 'singing' \| 'completed' | 'waiting' |
| addedAt | Date | Auto | ISO 8601 | now() |
| completedAt | Date | Auto | ISO 8601, solo se status='completed' | null |

### Esempi

#### Esempio Valido
```json
{
  "singerName": "Mario Rossi",
  "songTitle": "Volare",
  "artist": "Domenico Modugno",
  "tonality": -2
}
```

#### Esempio con Tutti i Campi
```json
{
  "id": 1,
  "singerName": "Laura Bianchi",
  "songTitle": "Nel blu dipinto di blu",
  "artist": "Domenico Modugno",
  "tonality": 0,
  "addedAt": "2025-10-28T21:00:00.000Z",
  "status": "waiting",
  "completedAt": null
}
```

## 🎵 Campo Tonalità (Tonality)

### Spiegazione
La tonalità indica di quanti semitoni alzare o abbassare la base musicale rispetto all'originale.

### Valori Possibili
- **-6**: 6 semitoni più basso (mezzo tono)
- **-5**: 5 semitoni più basso
- **-4**: 4 semitoni più basso
- **-3**: 3 semitoni più basso
- **-2**: 2 semitoni più basso
- **-1**: 1 semitono più basso
- **0**: Tonalità originale (default)
- **+1**: 1 semitono più alto
- **+2**: 2 semitoni più alto
- **+3**: 3 semitoni più alto
- **+4**: 4 semitoni più alto
- **+5**: 5 semitoni più alto
- **+6**: 6 semitoni più alto (mezzo tono)

### Implementazione Frontend
Usare un `<select>` dropdown o uno slider con valori discreti da -6 a +6.

## 🗄️ Database Schema (SQLite)

### Tabella: queue

```sql
CREATE TABLE queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  singer_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  tonality INTEGER NOT NULL DEFAULT 0 CHECK(tonality >= -6 AND tonality <= 6),
  added_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK(status IN ('waiting', 'singing', 'completed')),
  completed_at DATETIME,
  CONSTRAINT chk_tonality CHECK (tonality BETWEEN -6 AND 6)
);
```

### Tabella: queue_history

```sql
CREATE TABLE queue_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  singer_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  tonality INTEGER NOT NULL,
  added_at DATETIME NOT NULL,
  completed_at DATETIME NOT NULL,
  event_date DATE DEFAULT CURRENT_DATE
);
```

### Indici per Performance

```sql
CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_queue_added_at ON queue(added_at);
CREATE INDEX idx_history_event_date ON queue_history(event_date);
CREATE INDEX idx_history_artist ON queue_history(artist);
```

## 🔐 API Endpoints

### POST /api/queue - Aggiungere Cantante

**Request Body:**
```json
{
  "singerName": "Mario Rossi",
  "songTitle": "Volare",
  "artist": "Domenico Modugno",
  "tonality": -2
}
```

**Validazioni Backend:**
- `singerName`: required, string, trim, 1-50 caratteri
- `songTitle`: required, string, trim, 1-100 caratteri
- `artist`: required, string, trim, 1-50 caratteri
- `tonality`: required, number, integer, -6 <= tonality <= 6

**Response Success (201):**
```json
{
  "success": true,
  "message": "Aggiunto alla coda!",
  "data": {
    "id": 1,
    "singerName": "Mario Rossi",
    "songTitle": "Volare",
    "artist": "Domenico Modugno",
    "tonality": -2,
    "addedAt": "2025-10-28T21:00:00.000Z",
    "status": "waiting",
    "position": 1
  }
}
```

**Response Error (400):**
```json
{
  "success": false,
  "error": "Tutti i campi sono obbligatori"
}
```

```json
{
  "success": false,
  "error": "La tonalità deve essere un numero tra -6 e +6"
}
```

## 🎨 UI/UX Specifiche

### Form Pubblico - Campi

1. **Nome Cantante** (Input Text)
   - Label: "Il tuo nome:"
   - Placeholder: "Es: Mario Rossi"
   - Required: ✅
   - MaxLength: 50

2. **Titolo Canzone** (Input Text)
   - Label: "Titolo canzone:"
   - Placeholder: "Es: Volare"
   - Required: ✅
   - MaxLength: 100

3. **Interprete Originale** (Input Text)
   - Label: "Cantante originale:"
   - Placeholder: "Es: Domenico Modugno"
   - Required: ✅
   - MaxLength: 50

4. **Tonalità** (Select Dropdown o Number Input)
   - Label: "Tonalità:"
   - Options: -6, -5, -4, -3, -2, -1, 0, +1, +2, +3, +4, +5, +6
   - Default: 0
   - Required: ✅
   - Helper text: "0 = tonalità originale, negativo = più basso, positivo = più alto"

### Visualizzazione Coda

Ogni elemento nella coda deve mostrare:
```
[Posizione] Nome Cantante
           Titolo - Interprete Originale
           Tonalità: +2
```

Esempio:
```
[1] Mario Rossi
    Volare - Domenico Modugno
    Tonalità: -2
```

## 🔄 Stati del Cantante

1. **waiting**: In coda, in attesa del proprio turno
2. **singing**: Attualmente sul palco, sta cantando
3. **completed**: Ha finito di cantare, spostato nello storico

### Transizioni di Stato

```
waiting → singing   (pulsante admin "Sta cantando")
singing → completed (pulsante admin "Completato")
waiting → deleted   (pulsante admin "Rimuovi")
```

## 📱 Responsive Design

- **Mobile** (< 600px): Form a colonna singola, font ridotto
- **Tablet** (600-900px): Form a colonna singola, spacing aumentato
- **Desktop** (> 900px): Form ottimizzato, visualizzazione completa

## ⚡ Performance

- Auto-refresh coda: ogni 5 secondi (polling)
- Future: WebSocket per push real-time
- Database: SQLite per sviluppo, PostgreSQL per produzione

## 🎯 Priorità Implementazione

1. ✅ Aggiornare modello dati backend
2. ✅ Aggiornare validazioni controller
3. ✅ Aggiornare form frontend
4. ✅ Implementare database SQLite
5. ✅ Testare persistenza dati
6. Dashboard admin

---

_Ultimo aggiornamento: 2025-10-28_
