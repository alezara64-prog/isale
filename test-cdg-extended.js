// Test filtro file .cdg con pattern esteso

const testCases = [
  { input: "SF356-12-05 - David Bowie - China Girl.cdg", type: "cdg" },
  { input: "SF025-12 - Beatles - Yesterday.cdg", type: "cdg" },
  { input: "XY001-5 - Renato Zero - Il cielo.cdg", type: "cdg" },
  { input: "K99-999 - Madonna - Like a Prayer.cdg", type: "cdg" },
  { input: "ABC-1-2-3 - Queen - Bohemian Rhapsody.cdg", type: "cdg" },
  { input: "25698 - Il cielo - Renato Zero.mkf", type: "mkf" },
  { input: "12345 - Yesterday - The Beatles.dbk", type: "dbk" }
];

console.log("🧪 Test filtro .cdg esteso:\n");

testCases.forEach((test, index) => {
  let rawText = test.input;

  // Determina il tipo dal file originale
  const isCdgFormat = rawText.toLowerCase().includes('.cdg');

  // Rimuovi codice iniziale per file .cdg (pattern esteso)
  rawText = rawText.replace(/^[A-Z0-9]+(-\d+)+\s*-\s*/i, '').trim();

  // Rimuovi numero iniziale (a 5 cifre)
  rawText = rawText.replace(/^\d{5}\s*-\s*/, '').trim();

  // Rimuovi estensioni
  rawText = rawText.replace(/\.(mkf|dbk|cdg)$/i, '').trim();

  // Split
  const parts = rawText.split(' - ');

  let singerPart, songPart;

  if (isCdgFormat) {
    // Formato .cdg: "Cantante - Canzone"
    singerPart = parts[0].trim();
    songPart = parts[1].trim();
  } else {
    // Formato .mkf/.dbk: "Canzone - Cantante"
    songPart = parts[0].trim();
    singerPart = parts[1].trim();
  }

  console.log(`Test ${index + 1} (${test.type}):`);
  console.log(`  Input:    "${test.input}"`);
  console.log(`  Cantante: "${singerPart}"`);
  console.log(`  Canzone:  "${songPart}"`);
  console.log("");
});
