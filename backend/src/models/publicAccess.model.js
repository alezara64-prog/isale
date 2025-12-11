// Lista di cantanti e gruppi italiani famosi
const italianArtists = [
  'Vasco', 'Ligabue', 'Zucchero', 'Eros', 'Tiziano', 'Laura', 'Giorgia', 'Elisa',
  'Jovanotti', 'Pausini', 'Ramazzotti', 'Ferro', 'Mannoia', 'Vanoni', 'Baglioni',
  'Venditti', 'DeAndre', 'Battisti', 'Celentano', 'Mina', 'Modugno', 'Morandi',
  'Pooh', 'Matia', 'Negramaro', 'Subsonica', 'Litfiba', 'Stadio', 'Nomadi',
  'Maneskin', 'Mahmood', 'Blanco', 'Annalisa', 'Sangiovanni', 'Emma', 'Elodie',
  'Levante', 'Madame', 'Gabbani', 'Gazzelle', 'Calcutta', 'TheGiornalisti',
  'Verdena', 'Afterhours', 'Negrita', 'Caparezza', 'Fabri', 'Marracash',
  'Mengoni', 'Antonacci', 'Ranieri', 'Cutugno', 'Zanicchi', 'Pravo', 'Nannini',
  'Carboni', 'Grignani', 'Ruggeri', 'Bertè', 'Oxa', 'Masini', 'Zero', 'Concato',
  'Dalla', 'Guccini', 'Fossati', 'Neffa', 'Pezzali', 'Repetto', 'Cremonini',
  'Aleandro', 'Berte', 'Branduardi', 'Bungaro', 'Cammariere', 'Capossela',
  'Cocciante', 'DallaLucio', 'Daniele', 'DiMartino', 'Fabrizio', 'Fiorella',
  'Gaber', 'Grignaniola', 'Irama', 'Jarabe', 'Loredana', 'Mannoia', 'Mango',
  'Marcella', 'Nada', 'Nek', 'Orietta', 'Patty', 'Piero', 'Pupo', 'Renga',
  'Ricchi', 'Samuele', 'Simone', 'Toto', 'Ultimo', 'Vecchioni', 'Vianello',
  'Arisa', 'Berti', 'Biagio', 'Bugo', 'Carlotta', 'Casadei', 'Cristicchi',
  'Dargen', 'Diodato', 'Fedez', 'Fiorello', 'Garko', 'Gemelli', 'Ghali',
  'Giusy', 'Irama', 'Lacuna', 'LeMani', 'Loredana', 'Malika', 'Mannarino',
  'Margherita', 'Marlene', 'Michele', 'Nina', 'Noemi', 'Ornella', 'Pappalardo',
  'Paoli', 'Pinguini', 'Rancore', 'Raphael', 'Ricchi', 'Riki', 'Rino',
  'Rocco', 'Rovazzi', 'Samuel', 'Samuele', 'Syria', 'Tananai', 'Thegiornalisti',
  'Tiromancino', 'Togni', 'Tricarico', 'Valerio', 'Vanoni', 'Vasco', 'Vecchioni',
  'Vibrazioni', 'VincenzoCapossela', 'Vinicio', 'VivaLowCost', 'Wilma', 'Zarrillo'
];

// Stato in memoria
let currentPassword = null;

// Genera una nuova password
function generatePassword() {
  const artist = italianArtists[Math.floor(Math.random() * italianArtists.length)];
  const number = Math.floor(Math.random() * 100);
  currentPassword = `${artist}${number}`;
  console.log(`🔐 Nuova password pubblica generata: ${currentPassword}`);
  return currentPassword;
}

// Ottieni la password corrente (genera se non esiste)
function getCurrentPassword() {
  if (!currentPassword) {
    return generatePassword();
  }
  return currentPassword;
}

// Verifica se la password è corretta
function verifyPassword(password) {
  return password === currentPassword;
}

// Inizializza con una password
generatePassword();

module.exports = {
  generatePassword,
  getCurrentPassword,
  verifyPassword
};
