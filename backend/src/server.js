const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servire file statici dalla cartella uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Benvenuto a Karaoke Manager API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
const karaokeRoutes = require('./routes/karaoke.routes');
const queueRoutes = require('./routes/queue.routes');
const authRoutes = require('./routes/auth.routes');
const chatRoutes = require('./routes/chat.routes');
const publicChatRoutes = require('./routes/publicChat.routes');
const logoRoutes = require('./routes/logo.routes');
const socialIconsRoutes = require('./routes/socialIcons.routes');
const publicAccessRoutes = require('./routes/publicAccess.routes');
const eventStatusRoutes = require('./routes/eventStatus.routes');
const savedEventsRoutes = require('./routes/savedEvents.routes');
const songlistRoutes = require('./routes/songlist.routes');

app.use('/api/karaoke', karaokeRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/public-chat', publicChatRoutes);
app.use('/api/logo', logoRoutes);
app.use('/api/social-icons', socialIconsRoutes);
app.use('/api/public-access', publicAccessRoutes);
app.use('/api/event-status', eventStatusRoutes);
app.use('/api/saved-events', savedEventsRoutes);
app.use('/api/songlist', songlistRoutes);
// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Qualcosa è andato storto!' });
});

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0'; // Ascolta su tutte le interfacce di rete

app.listen(PORT, HOST, () => {
  console.log(`Server in esecuzione su porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n🌐 Accesso da altri dispositivi sulla rete locale:`);
  console.log(`   http://localhost:${PORT} (questo computer)`);

  // Mostra l'IP locale per l'accesso da altri dispositivi
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    networkInterfaces[interfaceName].forEach((interface) => {
      if (interface.family === 'IPv4' && !interface.internal) {
        console.log(`   http://${interface.address}:${PORT} (rete locale)`);
      }
    });
  });
  console.log('');
});

module.exports = app;


