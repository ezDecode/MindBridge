const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // 1. Fix <Text> props if they contain uppercase
  content = content.replace(/<Text([^>]+)>/g, (match, props) => {
    if (props.includes('uppercase')) {
      props = props.replace(/weight="bold"/g, 'weight="medium"');
      props = props.replace(/weight="semibold"/g, 'weight="medium"');
      props = props.replace(/weight="black"/g, 'weight="medium"');
    }
    return `<Text${props}>`;
  });

  // 2. Replace inside string literals that contain 'uppercase'
  content = content.replace(/(["'`])([^"'`]*\buppercase\b[^"'`]*)\1/g, (match, quote, inner) => {
    let safeInner = inner
        .replace(/\buppercase\b/g, ' ')
        .replace(/\btracking-(widest|wider|tighter|\[0\.15em\]|\[0\.2em\])\b/g, ' ')
        .replace(/\bfont-bold\b/g, 'font-medium')
        .replace(/\bfont-semibold\b/g, 'font-medium')
        .replace(/\bfont-black\b/g, 'font-medium')
        .replace(/ +/g, ' ');

    return quote + safeInner + quote;
  });

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    changedCount++;
  }
});

console.log('Changed files:', changedCount);