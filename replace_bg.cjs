const fs = require('fs');

function replaceFile(path) {
  let content = fs.readFileSync(path, 'utf8');

  // Change backgrounds to white
  content = content.replace(/bg-slate-50\/80/g, 'bg-white');
  content = content.replace(/bg-slate-50/g, 'bg-white');
  content = content.replace(/bg-\[#FEF9C3\]\/80/g, 'bg-white');
  content = content.replace(/bg-\[#FEF9C3\]/g, 'bg-white');
  
  // Make text darker
  content = content.replace(/text-slate-500/g, 'text-slate-700');
  content = content.replace(/text-gray-500/g, 'text-gray-700');
  content = content.replace(/text-slate-400/g, 'text-slate-600');
  content = content.replace(/text-gray-400/g, 'text-gray-600');
  
  fs.writeFileSync(path, content);
}

replaceFile('App.tsx');
fs.readdirSync('components').forEach(f => {
  if (f.endsWith('.tsx')) replaceFile('components/' + f);
});
