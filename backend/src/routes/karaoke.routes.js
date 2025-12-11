const express = require('express');
const router = express.Router();

// Esempio: Lista brani karaoke
// TODO: Implementare con database reale
router.get('/songs', (req, res) => {
  const songs = [
    { id: 1, title: 'My Way', artist: 'Frank Sinatra', duration: '4:35' },
    { id: 2, title: 'Bohemian Rhapsody', artist: 'Queen', duration: '5:55' },
    { id: 3, title: 'Hotel California', artist: 'Eagles', duration: '6:30' },
  ];
  res.json({ success: true, data: songs });
});

// Esempio: Dettaglio singolo brano
router.get('/songs/:id', (req, res) => {
  const { id } = req.params;
  // TODO: Query al database
  res.json({
    success: true,
    data: { id, title: 'Esempio Brano', artist: 'Artista' }
  });
});

// Esempio: Aggiungere nuovo brano
router.post('/songs', (req, res) => {
  const { title, artist, duration } = req.body;
  // TODO: Validazione e salvataggio nel database
  res.status(201).json({
    success: true,
    message: 'Brano aggiunto',
    data: { id: Date.now(), title, artist, duration }
  });
});

module.exports = router;
