// Test rimozione sigla MFG

const testCases = [
  "Volare MFG",
  "Yesterday MFG",
  "MFG La canzone",
  "Canzone MFG bella",
  "MFGABCD",  // Non dovrebbe essere toccato
  "mfg Nel mezzo",
  "Canzone senza sigla"
];

console.log("🧪 Test rimozione MFG:\n");

testCases.forEach((input, index) => {
  let songPart = input;

  // Rimuovi sigla MFG
  songPart = songPart.replace(/\bMFG\b/gi, '').trim();

  // Pulisci spazi multipli
  songPart = songPart.replace(/\s+/g, ' ').trim();

  console.log(`Test ${index + 1}:`);
  console.log(`  Input:  "${input}"`);
  console.log(`  Output: "${songPart}"`);
  console.log("");
});
