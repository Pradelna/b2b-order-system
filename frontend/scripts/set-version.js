// scripts/set-version.js
const fs = require('fs');
const path = require('path');

const now = new Date();
const version = `${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}-${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;

const filePath = path.join(__dirname, '../public/version.json');
fs.writeFileSync(filePath, `"${version}"`);
console.log('Version set to:', version);