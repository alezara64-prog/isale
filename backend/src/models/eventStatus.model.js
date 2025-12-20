const supabase = require('../config/supabase');

// Carica stato da Supabase (SEMPRE - no cache per compatibilità serverless Vercel)
async function loadStatusFromDB() {
  try {
    console.log('📊 [EventStatus] Caricamento stato da Supabase...');
    const { data, error } = await supabase
      .from('event_status')
      .select('*')
      .eq('key', 'eventIsOpen')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('❌ [EventStatus] Errore caricamento stato serata:', error);
      return null;
    }

    if (!data) {
      // Se non esiste, crea il record
      console.log('📝 [EventStatus] Record non trovato, creazione nuovo record...');
      const { data: newData, error: insertError } = await supabase
        .from('event_status')
        .insert([{ key: 'eventIsOpen', value: false }])
        .select()
        .single();

      if (insertError) {
        console.error('❌ [EventStatus] Errore creazione stato serata:', insertError);
        return { isOpen: false, openedAt: null, closedAt: null };
      }

      console.log('✅ [EventStatus] Record creato: isOpen=false');
      return { isOpen: false, openedAt: null, closedAt: null };
    }

    const status = {
      isOpen: data.value,
      openedAt: data.value ? data.updated_at : null,
      closedAt: data.value ? null : data.updated_at
    };
    console.log(`✅ [EventStatus] Stato caricato: isOpen=${status.isOpen}`);
    return status;
  } catch (err) {
    console.error('❌ [EventStatus] Errore nel caricamento stato:', err);
    return { isOpen: false, openedAt: null, closedAt: null };
  }
}

// Salva stato su Supabase
async function saveStatusToDB(isOpen) {
  try {
    console.log(`💾 [EventStatus] Salvataggio stato su Supabase: isOpen=${isOpen}`);
    const { error } = await supabase
      .from('event_status')
      .update({ value: isOpen, updated_at: new Date().toISOString() })
      .eq('key', 'eventIsOpen');

    if (error) {
      console.error('❌ [EventStatus] Errore salvataggio stato serata:', error);
      return false;
    }

    console.log(`✅ [EventStatus] Stato salvato con successo: isOpen=${isOpen}`);
    return true;
  } catch (err) {
    console.error('❌ [EventStatus] Errore nel salvataggio stato:', err);
    return false;
  }
}

// Ottieni lo stato corrente della serata (sempre da DB, no cache)
async function getEventStatus() {
  console.log('🔍 [EventStatus] Richiesta stato corrente...');
  const status = await loadStatusFromDB();
  return status || { isOpen: false, openedAt: null, closedAt: null };
}

// Apri la serata
async function openEvent() {
  console.log('🎉 [EventStatus] Apertura serata...');
  const success = await saveStatusToDB(true);

  if (success) {
    console.log('✅ [EventStatus] Serata aperta e salvata su Supabase!');
  } else {
    console.error('⚠️ [EventStatus] Errore durante apertura serata');
  }

  // Ricarica lo stato aggiornato da DB
  return await getEventStatus();
}

// Chiudi la serata
async function closeEvent() {
  console.log('🔒 [EventStatus] Chiusura serata...');
  const success = await saveStatusToDB(false);

  if (success) {
    console.log('✅ [EventStatus] Serata chiusa e salvata su Supabase!');
  } else {
    console.error('⚠️ [EventStatus] Errore durante chiusura serata');
  }

  // Ricarica lo stato aggiornato da DB
  return await getEventStatus();
}

// Toggle stato serata
async function toggleEventStatus() {
  console.log('🔄 [EventStatus] Toggle stato serata...');
  const currentStatus = await getEventStatus();
  console.log(`📊 [EventStatus] Stato attuale prima del toggle: isOpen=${currentStatus.isOpen}`);

  if (currentStatus.isOpen) {
    return await closeEvent();
  } else {
    return await openEvent();
  }
}

module.exports = {
  getEventStatus,
  openEvent,
  closeEvent,
  toggleEventStatus
};
