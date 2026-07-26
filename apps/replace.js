const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = fs.statSync(dirFile).isDirectory()
        ? walkSync(dirFile, filelist)
        : filelist.concat(dirFile);
    } catch (err) {
      if (err.code === 'ENOENT') {
        return filelist;
      }
      throw err;
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname));
files.filter(f => f.endsWith('.ts') || f.endsWith('.tsx')).forEach(file => {
  if (file.includes('node_modules') || file.includes('.next')) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content
    .replace(/http:\/\/localhost:3001/g, 'https://api.algomatrixai.com')
    .replace(/http:\/\/localhost:3000/g, 'https://api.algomatrixai.com');
    
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
});
