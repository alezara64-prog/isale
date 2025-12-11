// Test per verificare la logica di parsing

const testCases = [
  "25698 - Il cielo - Renato Zero.mkf",
  "12943 - EPO ti amo (parodia Tour de France 2007) - Karaoke Vari.dbk",
  "10000 - Le mur de la prison d'en face - Yves Duteil.dbk",
  "12345 - Yesterday - The Beatles.mkf"
];

console.log("🧪 Test logica di parsing:\n");

testCases.forEach((input, index) => {
  console.log(`Test ${index + 1}: "${input}"`);

  let rawText = input;

  // Rimuovi numero iniziale (a 5 cifre)
  rawText = rawText.replace(/^\d{5}\s*-\s*/, '').trim();
  console.log(`  Dopo rimozione numero: "${rawText}"`);

  // Rimuovi estensioni
  rawText = rawText.replace(/\.(mkf|dbk)$/i, '').trim();
  console.log(`  Dopo rimozione estensione: "${rawText}"`);

  // Split
  const parts = rawText.split(' - ');
  console.log(`  Parti: ${parts.length}`);

  // Prima parte = Canzone, Seconda parte = Cantante
  const songPart = parts[0].trim();
  const singerPart = parts[1].trim();

  console.log(`  ✅ Cantante: "${singerPart}"`);
  console.log(`  ✅ Canzone: "${songPart}"`);
  console.log("");
});
