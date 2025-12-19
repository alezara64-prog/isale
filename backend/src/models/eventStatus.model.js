const supabase = require('../config/supabase');

// Cache in memoria per performance (evita query continue)
let cachedStatus = {
  isOpen: false,
  openedAt: null,
  closedAt: null,
  lastFetch: null
};

const CACHE_TTL = 3000; // 3 secondi di cache

// Carica stato da Supabase
async function loadStatusFromDB() {
  try {
    const { data, error } = await supabase
      .from('event_status')
      .select('*')
      .eq('key', 'eventIsOpen')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ Errore caricamento stato serata:', error);
      return null;
    }

    if (!data) {
      // Se non esiste, crea il record
      const { data: newData, error: insertError } = await supabase
        .from('event_status')
        .insert([{ key: 'eventIsOpen', value: false }])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Errore creazione stato serata:', insertError);
        return { isOpen: false, openedAt: null, closedAt: null };
      }

      return { isOpen: false, openedAt: null, closedAt: null };
    }

    return {
      isOpen: data.value,
      openedAt: data.value ? data.updated_at : null,
      closedAt: data.value ? null : data.updated_at
    };
  } catch (err) {
    console.error('❌ Errore nel caricamento stato:', err);
    return cachedStatus;
  }
}

// Salva stato su Supabase
async function saveStatusToDB(isOpen) {
  try {
    const { error } = await supabase
      .from('event_status')
      .update({ value: isOpen, updated_at: new Date().toISOString() })
      .eq('key', 'eventIsOpen');

    if (error) {
      console.error('❌ Errore salvataggio stato serata:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('❌ Errore nel salvataggio stato:', err);
    return false;
  }
}

// Ottieni lo stato corrente della serata
async function getEventStatus() {
  const now = Date.now();

  // Usa cache se recente
  if (cachedStatus.lastFetch && (now - cachedStatus.lastFetch) < CACHE_TTL) {
    return { ...cachedStatus };
  }

  // Altrimenti carica da DB
  const status = await loadStatusFromDB();
  if (status) {
    cachedStatus = { ...status, lastFetch: now };
  }

  return { ...cachedStatus };
}

// Apri la serata
async function openEvent() {
  const success = await saveStatusToDB(true);

  if (success) {
    cachedStatus.isOpen = true;
    cachedStatus.openedAt = new Date().toISOString();
    cachedStatus.closedAt = null;
    cachedStatus.lastFetch = Date.now();
    console.log('🎉 Serata aperta e salvata su Supabase!');
  } else {
    console.error('⚠️ Serata aperta in cache ma non salvata su DB');
  }

  return { ...cachedStatus };
}

// Chiudi la serata
async function closeEvent() {
  const success = await saveStatusToDB(false);

  if (success) {
    cachedStatus.isOpen = false;
    cachedStatus.closedAt = new Date().toISOString();
    cachedStatus.lastFetch = Date.now();
    console.log('🔒 Serata chiusa e salvata su Supabase!');
  } else {
    console.error('⚠️ Serata chiusa in cache ma non salvata su DB');
  }

  return { ...cachedStatus };
}

// Toggle stato serata
async function toggleEventStatus() {
  const currentStatus = await getEventStatus();

  if (currentStatus.isOpen) {
    return await closeEvent();
  } else {
    return await openEvent();
  }
}

// Inizializza caricando lo stato all'avvio
loadStatusFromDB().then(status => {
  if (status) {
    cachedStatus = { ...status, lastFetch: Date.now() };
    console.log(`📊 Stato serata iniziale: ${status.isOpen ? '🟢 Aperta' : '🔴 Chiusa'}`);
  }
});

module.exports = {
  getEventStatus,
  openEvent,
  closeEvent,
  toggleEventStatus
};
