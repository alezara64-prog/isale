import { useState, useEffect } from 'react';
import api from '../config/api';

function SongList() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/karaoke/songs');
      setSongs(response.data.data);
      setError(null);
    } catch (err) {
      setError('Errore nel caricamento dei brani');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Lista Brani Karaoke</h2>
      <ul>
        {songs.map(song => (
          <li key={song.id}>
            <strong>{song.title}</strong> - {song.artist} ({song.duration})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SongList;
