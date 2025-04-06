const fs = require('fs');
const path = require('path');

const version = process.env.VITE_APP_VERSION || 'dev';
const outputPath = path.join(__dirname, 'public', 'meta.json');

fs.writeFileSync(outputPath, JSON.stringify({ version }, null, 2));
console.log(`✅ meta.json generated with version: ${version}`);