const matter = require('gray-matter');
const fs = require('fs');
const path = require('path');

// MockのZodスキーマ（validation.tsと同じロジック）
const mockValidate = (data) => {
  console.log('Input data:', JSON.stringify(data, null, 2));
  
  // タイトル変換
  const title = String(data.title);
  console.log('Title converted:', title, typeof title);
  
  // ID変換
  const id = String(data.id);
  console.log('ID converted:', id, typeof id);
  
  // 日付変換
  const convertDate = (val) => {
    if (val instanceof Date) {
      return val.toISOString().split('T')[0];
    }
    const stringVal = String(val);
    if (stringVal.includes('T')) {
      return stringVal.split('T')[0];
    }
    return stringVal;
  };
  
  const created = convertDate(data.created);
  const updated = convertDate(data.updated);
  console.log('Created converted:', created, typeof created);
  console.log('Updated converted:', updated, typeof updated);
  
  // タグ処理
  const tags = data.tags || [];
  console.log('Tags:', tags, typeof tags);
  
  return {
    title,
    id,
    created,
    updated,
    tags
  };
};

// テスト実行
const testFile = path.join(__dirname, 'Songs', '20250726_1723.md');
console.log('Testing validation with file:', testFile);

try {
  const fileContents = fs.readFileSync(testFile, 'utf8');
  const { data } = matter(fileContents);
  
  const result = mockValidate(data);
  console.log('\nValidation result:', JSON.stringify(result, null, 2));
  
  // RotomSongsタグチェック
  const hasRotomSongs = result.tags.includes('RotomSongs');
  console.log('Has RotomSongs tag:', hasRotomSongs);
  
} catch (error) {
  console.error('Error:', error);
}