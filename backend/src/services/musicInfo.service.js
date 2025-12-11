const axios = require('axios');

// Servizio per recuperare informazioni sulle canzoni da API pubbliche
// Utilizza MusicBrainz API (gratuita, no API key richiesta)

const MUSICBRAINZ_API = 'https://musicbrainz.org/ws/2';
const USER_AGENT = 'KaraokeManager/1.0.0 (contact@karaokemanager.com)';

class MusicInfoService {
  /**
   * Cerca gli autori di una canzone usando MusicBrainz
   * @param {string} songTitle - Titolo della canzone
   * @param {string} artistName - Nome dell'artista/interprete
   * @returns {Promise<string|null>} - Autori trovati o null
   */
  static async findSongAuthors(songTitle, artistName) {
    try {
      console.log(`🔍 Cerco autori per: "${songTitle}" di ${artistName}`);

      // Cerca la canzone su MusicBrainz
      const searchUrl = `${MUSICBRAINZ_API}/recording/`;
      const params = {
        query: `recording:"${songTitle}" AND artist:"${artistName}"`,
        fmt: 'json',
        limit: 1
      };

      const response = await axios.get(searchUrl, {
        params,
        headers: {
          'User-Agent': USER_AGENT
        }
      });

      if (response.data.recordings && response.data.recordings.length > 0) {
        const recording = response.data.recordings[0];

        // Estrai gli autori (writers/composers)
        // In MusicBrainz, gli autori sono nelle "work-relations"
        if (recording['work-relation-list'] && recording['work-relation-list'].length > 0) {
          const workRelation = recording['work-relation-list'][0];
          const workId = workRelation.work.id;

          // Ottieni i dettagli del work per trovare gli autori
          const authors = await this.getWorkAuthors(workId);
          if (authors) {
            console.log(`✅ Autori trovati: ${authors}`);
            return authors;
          }
        }

        // Se non ci sono work-relations, prova con gli artist-credits
        if (recording['artist-credit'] && recording['artist-credit'].length > 0) {
          const artists = recording['artist-credit']
            .map(ac => ac.name || ac.artist?.name)
            .filter(Boolean)
            .join(', ');

          if (artists) {
            console.log(`✅ Artisti trovati: ${artists}`);
            return artists;
          }
        }
      }

      console.log(`⚠️ Nessun autore trovato per "${songTitle}"`);
      return null;
    } catch (error) {
      console.error(`❌ Errore nella ricerca autori per "${songTitle}":`, error.message);
      return null;
    }
  }

  /**
   * Ottiene gli autori di un work da MusicBrainz
   * @param {string} workId - ID del work su MusicBrainz
   * @returns {Promise<string|null>} - Autori trovati o null
   */
  static async getWorkAuthors(workId) {
    try {
      const workUrl = `${MUSICBRAINZ_API}/work/${workId}`;
      const params = {
        inc: 'artist-rels',
        fmt: 'json'
      };

      // Attendi 1 secondo per rispettare il rate limit di MusicBrainz
      await this.sleep(1000);

      const response = await axios.get(workUrl, {
        params,
        headers: {
          'User-Agent': USER_AGENT
        }
      });

      if (response.data.relations) {
        const composers = response.data.relations
          .filter(rel => rel.type === 'composer' || rel.type === 'writer' || rel.type === 'lyricist')
          .map(rel => rel.artist?.name)
          .filter(Boolean);

        if (composers.length > 0) {
          return composers.join(', ');
        }
      }

      return null;
    } catch (error) {
      console.error(`❌ Errore nel recupero work ${workId}:`, error.message);
      return null;
    }
  }

  /**
   * Cerca gli autori per un batch di canzoni
   * @param {Array} songs - Array di oggetti {title, artist}
   * @param {Function} progressCallback - Callback opzionale per il progresso
   * @returns {Promise<Array>} - Array di risultati con autori
   */
  static async findAuthorsForSongs(songs, progressCallback = null) {
    const results = [];
    const total = songs.length;

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const authors = await this.findSongAuthors(song.title, song.artist);

      results.push({
        title: song.title,
        artist: song.artist,
        authors: authors
      });

      if (progressCallback) {
        progressCallback(i + 1, total);
      }

      // Rispetta il rate limit di MusicBrainz (1 richiesta al secondo)
      if (i < songs.length - 1) {
        await this.sleep(1000);
      }
    }

    return results;
  }

  /**
   * Helper per attendere
   * @param {number} ms - Millisecondi da attendere
   * @returns {Promise}
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Cerca informazioni su una canzone usando un approccio semplificato
   * Questa versione è più veloce ma meno precisa
   * @param {string} songTitle - Titolo della canzone
   * @param {string} artistName - Nome dell'artista
   * @returns {Promise<string|null>}
   */
  static async findSongAuthorsSimple(songTitle, artistName) {
    try {
      const searchUrl = `${MUSICBRAINZ_API}/recording/`;
      const params = {
        query: `"${songTitle}" ${artistName}`,
        fmt: 'json',
        limit: 1
      };

      const response = await axios.get(searchUrl, {
        params,
        headers: {
          'User-Agent': USER_AGENT
        }
      });

      if (response.data.recordings && response.data.recordings.length > 0) {
        const recording = response.data.recordings[0];

        if (recording['artist-credit']) {
          const artists = recording['artist-credit']
            .map(ac => ac.name || ac.artist?.name)
            .filter(Boolean)
            .join(', ');

          return artists || null;
        }
      }

      return null;
    } catch (error) {
      console.error(`Errore ricerca semplice per "${songTitle}":`, error.message);
      return null;
    }
  }
}

module.exports = MusicInfoService;
