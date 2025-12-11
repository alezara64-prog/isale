// Stato in memoria della serata
let eventStatus = {
  isOpen: false, // Di default la serata è chiusa
  openedAt: null,
  closedAt: null
};

// Ottieni lo stato corrente della serata
function getEventStatus() {
  return eventStatus;
}

// Apri la serata
function openEvent() {
  eventStatus.isOpen = true;
  eventStatus.openedAt = new Date().toISOString();
  eventStatus.closedAt = null;
  console.log('🎉 Serata aperta!');
  return eventStatus;
}

// Chiudi la serata
function closeEvent() {
  eventStatus.isOpen = false;
  eventStatus.closedAt = new Date().toISOString();
  console.log('🔒 Serata chiusa!');
  return eventStatus;
}

// Toggle stato serata
function toggleEventStatus() {
  if (eventStatus.isOpen) {
    return closeEvent();
  } else {
    return openEvent();
  }
}

module.exports = {
  getEventStatus,
  openEvent,
  closeEvent,
  toggleEventStatus
};
