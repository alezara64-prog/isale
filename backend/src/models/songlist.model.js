// Modello per la lista canzoni karaoke - Versione Supabase
const supabase = require('../config/supabase');

class SongListModel {
  // Ottieni tutti i cantanti e le loro canzoni
  static async getAll() {
    const { data: singers, error: singersError } = await supabase
      .from('singers')
      .select('id, name');

    if (singersError) throw singersError;

    const { data: songs, error: songsError } = await supabase
      .from('songs')
      .select('*');

    if (songsError) throw songsError;

    // Ricostruisci la struttura {singerName: [songs]}
    const songDatabase = {};
    singers.forEach(singer => {
      const singerSongs = songs
        .filter(s => s.singer_id === singer.id)
        .map(s => ({
          title: s.title,
          tonality: s.tonality,
          format: s.song_format
        }));

      if (singerSongs.length > 0) {
        songDatabase[singer.name] = singerSongs;
      }
    });

    return {
      singers: songDatabase,
      lastUpdated: new Date().toISOString(),
      totalSingers: Object.keys(songDatabase).length,
      totalSongs: songs.length
    };
  }

  // Ottieni i cantanti in ordine alfabetico
  static async getSingersAlphabetically() {
    const data = await this.getAll();
    const singers = Object.keys(data.singers).sort((a, b) =>
      a.localeCompare(b, 'it', { sensitivity: 'base' })
    );

    const result = {};
    singers.forEach(singer => {
      result[singer] = data.singers[singer].sort((a, b) =>
        a.title.localeCompare(b.title, 'it', { sensitivity: 'base' })
      );
    });

    return result;
  }

  // Cerca cantanti per nome
  static async searchSingers(query) {
    if (!query || query.trim() === '') return {};

    const { data: singers, error } = await supabase
      .from('singers')
      .select('id, name')
      .ilike('name', `%${query}%`);

    if (error) throw error;

    const result = {};

    for (const singer of singers) {
      const { data: songs } = await supabase
        .from('songs')
        .select('*')
        .eq('singer_id', singer.id);

      if (songs && songs.length > 0) {
        result[singer.name] = songs.map(s => ({
          title: s.title,
          tonality: s.tonality,
          format: s.song_format
        }));
      }
    }

    return result;
  }

  // Cerca canzoni per titolo
  static async searchSongs(query) {
    if (!query || query.trim() === '') return {};

    const { data: songs, error } = await supabase
      .from('songs')
      .select(`
        *,
        singers (name)
      `)
      .ilike('title', `%${query}%`);

    if (error) throw error;

    const result = {};

    songs.forEach(song => {
      const singerName = song.singers.name;

      if (!result[singerName]) {
        result[singerName] = [];
      }

      result[singerName].push({
        title: song.title,
        tonality: song.tonality,
        format: song.song_format
      });
    });

    return result;
  }

  // Cerca per cantante E canzone
  static async searchBoth(singerQuery, songQuery) {
    if ((!singerQuery || singerQuery.trim() === '') &&
        (!songQuery || songQuery.trim() === '')) {
      return this.getSingersAlphabetically();
    }

    if (singerQuery && singerQuery.trim() !== '' && (!songQuery || songQuery.trim() === '')) {
      return this.searchSingers(singerQuery);
    }

    if (songQuery && songQuery.trim() !== '' && (!singerQuery || singerQuery.trim() === '')) {
      return this.searchSongs(songQuery);
    }

    // Cerca entrambi
    const { data: songs, error } = await supabase
      .from('songs')
      .select(`
        *,
        singers (name)
      `)
      .ilike('title', `%${songQuery}%`);

    if (error) throw error;

    const result = {};

    songs.forEach(song => {
      const singerName = song.singers.name;

      if (singerName.toLowerCase().includes(singerQuery.toLowerCase())) {
        if (!result[singerName]) {
          result[singerName] = [];
        }

        result[singerName].push({
          title: song.title,
          tonality: song.tonality,
          format: song.song_format
        });
      }
    });

    return result;
  }

  // Aggiungi un singolo cantante con le sue canzoni
  static async addSinger(singerName, songs) {
    if (!singerName || !songs || !Array.isArray(songs)) {
      throw new Error('Nome cantante e array di canzoni richiesti');
    }

    // Inserisci il cantante
    const { data: singer, error: singerError } = await supabase
      .from('singers')
      .insert({ name: singerName })
      .select()
      .single();

    if (singerError) throw singerError;

    // Inserisci le canzoni
    const songsToInsert = songs.map(song => ({
      singer_id: singer.id,
      title: song.title || song,
      tonality: song.tonality || null,
      song_format: song.format || null
    }));

    const { data: insertedSongs, error: songsError } = await supabase
      .from('songs')
      .insert(songsToInsert)
      .select();

    if (songsError) throw songsError;

    return insertedSongs.map(s => ({
      title: s.title,
      tonality: s.tonality,
      format: s.song_format
    }));
  }

  // Aggiungi una canzone a un cantante esistente
  static async addSongToSinger(singerName, songTitle, tonality = null, format = null) {
    // Trova o crea il cantante
    let { data: singer, error } = await supabase
      .from('singers')
      .select('id')
      .eq('name', singerName)
      .single();

    if (!singer) {
      const { data: newSinger, error: insertError } = await supabase
        .from('singers')
        .insert({ name: singerName })
        .select()
        .single();

      if (insertError) throw insertError;
      singer = newSinger;
    }

    // Inserisci la canzone
    const { data: song, error: songError } = await supabase
      .from('songs')
      .insert({
        singer_id: singer.id,
        title: songTitle,
        tonality: tonality,
        song_format: format
      })
      .select()
      .single();

    if (songError) throw songError;

    return song;
  }

  // Rimuovi un cantante
  static async removeSinger(singerName) {
    const { error } = await supabase
      .from('singers')
      .delete()
      .eq('name', singerName);

    if (error) throw error;
    return true;
  }

  // Rimuovi una canzone
  static async removeSong(singerName, songTitle) {
    const { data: singer } = await supabase
      .from('singers')
      .select('id')
      .eq('name', singerName)
      .single();

    if (!singer) return false;

    const { error } = await supabase
      .from('songs')
      .delete()
      .eq('singer_id', singer.id)
      .eq('title', songTitle);

    if (error) throw error;
    return true;
  }

  // Statistiche
  static async getStats() {
    const { count: totalSingers } = await supabase
      .from('singers')
      .select('*', { count: 'exact', head: true });

    const { count: totalSongs } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true });

    return {
      totalSingers,
      totalSongs,
      lastUpdated: new Date().toISOString()
    };
  }
}

module.exports = SongListModel;
