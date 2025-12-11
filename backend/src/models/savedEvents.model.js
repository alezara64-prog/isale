// Serate salvate in memoria
let savedEvents = [];
let nextId = 1;

// Ottieni tutte le serate salvate
function getAllSavedEvents() {
  return savedEvents.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
}

// Ottieni una serata specifica per ID
function getSavedEventById(id) {
  return savedEvents.find(event => event.id === parseInt(id));
}

// Salva una nuova serata
function saveEvent(eventData) {
  const newEvent = {
    id: nextId++,
    eventDate: eventData.eventDate,
    venueName: eventData.venueName,
    queue: eventData.queue || [],
    savedAt: new Date().toISOString(),
    totalSongs: eventData.queue ? eventData.queue.length : 0
  };

  savedEvents.push(newEvent);
  console.log(`💾 Serata salvata! ID: ${newEvent.id}, Data: ${newEvent.eventDate}`);
  return newEvent;
}

// Elimina una serata salvata
function deleteSavedEvent(id) {
  const index = savedEvents.findIndex(event => event.id === parseInt(id));
  if (index === -1) {
    return null;
  }

  const deleted = savedEvents.splice(index, 1)[0];
  console.log(`🗑️ Serata eliminata! ID: ${deleted.id}`);
  return deleted;
}

// Elimina tutte le serate salvate
function deleteAllSavedEvents() {
  const count = savedEvents.length;
  savedEvents = [];
  console.log(`🗑️ Tutte le ${count} serate sono state eliminate`);
  return count;
}

module.exports = {
  getAllSavedEvents,
  getSavedEventById,
  saveEvent,
  deleteSavedEvent,
  deleteAllSavedEvents
};
