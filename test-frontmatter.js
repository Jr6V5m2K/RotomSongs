const matter = require('gray-matter');
const fs = require('fs');
const path = require('path');

// テスト用のファイルパス
const testFile = path.join(__dirname, 'Songs', '20250726_1723.md');

console.log('Testing frontmatter parsing...');
console.log('File path:', testFile);

try {
  const fileContents = fs.readFileSync(testFile, 'utf8');
  const { data, content } = matter(fileContents);
  
  console.log('Gray-matter result:');
  console.log('Data:', JSON.stringify(data, null, 2));
  console.log('Data types:');
  console.log('- title:', typeof data.title, data.title);
  console.log('- id:', typeof data.id, data.id);
  console.log('- created:', typeof data.created, data.created);
  console.log('- updated:', typeof data.updated, data.updated);
  console.log('- tags:', typeof data.tags, data.tags);
  
} catch (error) {
  console.error('Error:', error);
}