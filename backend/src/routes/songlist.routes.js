const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const SongListController = require('../controllers/songlist.controller');
const { authenticateAdmin } = require('../middleware/auth.middleware');

// Configurazione multer per l'upload dei file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Cartella dove salvare i file temporanei
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accetta solo file Excel (.xlsx, .xls)
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Solo file Excel (.xlsx, .xls) sono ammessi'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite 10MB
  }
});

// Route pubbliche
router.get('/', SongListController.getAllSongs);
router.get('/search', SongListController.searchSongs);
router.get('/stats', SongListController.getStats);
router.get('/find-authors', SongListController.findAuthors);

// Route protette (solo admin)
router.post('/upload', authenticateAdmin, upload.single('file'), SongListController.uploadPDF);
router.post('/singer', authenticateAdmin, SongListController.addSinger);
router.put('/singer/:oldName/rename', authenticateAdmin, SongListController.renameSinger);
router.put('/singer/:singerName/song/:oldTitle/rename', authenticateAdmin, SongListController.renameSong);
router.delete('/singer/:name', authenticateAdmin, SongListController.removeSinger);
router.post('/reset', authenticateAdmin, SongListController.resetDatabase);

module.exports = router;
