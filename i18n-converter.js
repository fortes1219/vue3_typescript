// i18n-converter.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 獲取當前檔案的目錄
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 支援的語言列表
const SUPPORTED_LANGUAGES = ['zh-TW', 'zh-CN', 'en-US'];

/**
 * 將巢狀的 JSON 物件轉換為平面化的資料列陣列
 * @param {Object} obj - JSON 物件
 * @param {string[]} filePath - 當前路徑
 * @param {string} sourceLang - 來源語言
 */
function traverseJSON(obj, filePath = [], sourceLang = 'en-US') {
  const rows = [];

  for (const key in obj) {
    const newPath = [...filePath, key];

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // 遞迴處理巢狀物件
      const nestedRows = traverseJSON(obj[key], newPath, sourceLang);
      rows.push(...nestedRows);
    } else {
      // 葉節點 - 這是一個翻譯值
      const row = {
        category: newPath[0] || '',
        section: newPath[1] || '',
        item: newPath[2] || ''
      };

      // 初始化所有語言欄位為空字串
      SUPPORTED_LANGUAGES.forEach(lang => {
        row[lang.replace('-', '')] = '';
      });

      // 設置對應語言的值
      const langKey = sourceLang.replace('-', '');
      row[langKey] = obj[key];

      rows.push(row);
    }
  }

  return rows;
}

/**
 * 將JSON檔案轉換為CSV
 * @param {string} inputFile - 輸入的JSON檔案路徑
 * @param {string} outputFile - 輸出的CSV檔案路徑
 * @param {string} sourceLang - 來源語言，預設為 'en-US'
 */
function convertJSONToCSV(inputFile, outputFile, sourceLang = 'en-US') {
  try {
    console.log(`開始轉換: ${inputFile} → ${outputFile} (語言: ${sourceLang})`);

    // 讀取JSON檔案
    const jsonContent = fs.readFileSync(inputFile, 'utf8');
    const jsonData = JSON.parse(jsonContent);

    // 轉換為資料列
    const rows = traverseJSON(jsonData, [], sourceLang);

    // 產生CSV標題列
    const headers = ['Category', 'Section', 'Item', ...SUPPORTED_LANGUAGES];
    let csvContent = headers.join(',') + '\n';

    // 將每一列資料轉換為CSV行
    for (const row of rows) {
      const values = [
        `"${row.category}"`,
        `"${row.section}"`,
        `"${row.item}"`,
        ...SUPPORTED_LANGUAGES.map(lang => {
          const langKey = lang.replace('-', '');
          return `"${row[langKey] || ''}"`;
        })
      ];
      csvContent += values.join(',') + '\n';
    }

    // 寫入CSV檔案
    fs.writeFileSync(outputFile, csvContent);
    console.log(`✅ 轉換成功: ${inputFile} → ${outputFile}`);
  } catch (error) {
    console.error('❌ 轉換失敗:', error);
    process.exit(1);
  }
}

/**
 * 將多個JSON檔案合併為一份CSV
 * @param {string} inputDir - 包含JSON檔案的目錄
 * @param {string} outputFile - 輸出的CSV檔案路徑
 * @param {string[]} targetLangs - 要合併的語言列表，預設為所有支援的語言
 */
function convertMultipleJSONToCSV(inputDir, outputFile, targetLangs = SUPPORTED_LANGUAGES) {
  try {
    console.log(`開始合併: ${inputDir} → ${outputFile}`);
    console.log(`目標語言: ${targetLangs.join(', ')}`);

    // 讀取所有語言的JSON檔案
    const allData = {};
    const allKeys = new Set();

    for (const lang of targetLangs) {
      const jsonFile = path.join(inputDir, `${lang}.json`);

      if (fs.existsSync(jsonFile)) {
        console.log(`讀取 ${lang} 檔案: ${jsonFile}`);
        const jsonContent = fs.readFileSync(jsonFile, 'utf8');
        const jsonData = JSON.parse(jsonContent);

        // 將JSON轉換為平面化的key-value對
        const flatData = flattenJSON(jsonData);
        allData[lang] = flatData;

        // 收集所有可能的key
        Object.keys(flatData).forEach(key => allKeys.add(key));
      } else {
        console.log(`⚠️  找不到 ${lang} 檔案: ${jsonFile}`);
        allData[lang] = {};
      }
    }

    // 將所有key轉換為陣列並排序
    const sortedKeys = Array.from(allKeys).sort();

    // 產生CSV標題列
    const headers = ['Category', 'Section', 'Item', ...targetLangs];
    let csvContent = headers.join(',') + '\n';

    // 為每個key產生一行CSV資料
    for (const key of sortedKeys) {
      const pathParts = key.split('.');
      const category = pathParts[0] || '';
      const section = pathParts[1] || '';
      const item = pathParts[2] || '';

      const values = [
        `"${category}"`,
        `"${section}"`,
        `"${item}"`,
        ...targetLangs.map(lang => {
          const value = allData[lang][key] || '';
          return `"${value.replace(/"/g, '""')}"`;
        })
      ];
      csvContent += values.join(',') + '\n';
    }

    // 寫入CSV檔案
    fs.writeFileSync(outputFile, csvContent);
    console.log(`✅ 合併成功: ${outputFile}`);
    console.log(`📊 共處理 ${sortedKeys.length} 個翻譯項目`);
  } catch (error) {
    console.error('❌ 合併失敗:', error);
    process.exit(1);
  }
}

/**
 * 將巢狀JSON物件轉換為平面化的key-value對
 * @param {Object} obj - JSON物件
 * @param {string} prefix - 前綴路徑
 * @returns {Object} 平面化的物件
 */
function flattenJSON(obj, prefix = '') {
  const result = {};

  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      // 遞迴處理巢狀物件
      const nested = flattenJSON(obj[key], newKey);
      Object.assign(result, nested);
    } else {
      // 葉節點
      result[newKey] = obj[key];
    }
  }

  return result;
}

/**
 * 將CSV檔案轉換回JSON
 * @param {string} inputFile - 輸入的CSV檔案路徑
 * @param {Object} outputFiles - 輸出的JSON檔案路徑，格式為 {語言: 檔案路徑}
 * @param {string[]} targetLangs - 目標語言列表，預設為所有支援的語言
 */
function convertCSVToJSON(inputFile, outputFiles, targetLangs = SUPPORTED_LANGUAGES) {
  try {
    console.log(`開始轉換: ${inputFile} → JSON檔案`);
    console.log(`目標語言: ${targetLangs.join(', ')}`);

    // 讀取CSV檔案
    const csvContent = fs.readFileSync(inputFile, 'utf8');
    // 統一使用 LF 換行符 (\n)，移除可能的 \r 字符
    const normalizedContent = csvContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const lines = normalizedContent.split('\n');

    // 解析CSV標題
    const headers = lines[0].split(',').map(h => h.trim());

    // 確定各語言欄位的索引
    const langIndices = {};
    SUPPORTED_LANGUAGES.forEach(lang => {
      langIndices[lang] = headers.indexOf(lang);
    });

    // 為每種語言建立一個空JSON物件
    const results = {};
    targetLangs.forEach(lang => {
      results[lang] = {};
    });

    // 處理每一行
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // 解析CSV行，考慮引號內可能有逗號的情況
      const rowRegex = /(?:^|,)("(?:[^"]*(?:"")?[^"]*)*"|[^,]*)/g;
      const matches = [...lines[i].matchAll(rowRegex)];
      const values = matches.map(m => {
        let val = m[1];
        // 如果是引號括起來的值，去掉引號
        if (val.startsWith('"') && val.endsWith('"')) {
          val = val.substring(1, val.length - 1).replace(/""/g, '"');
        }
        // 清除任何殘留的 \r 字符
        return val.replace(/\r/g, '');
      });

      const category = values[0];
      const section = values[1];
      const item = values[2];

      // 忽略沒有分類的行
      if (!category) continue;

      // 取得各語言的值並加入相應的JSON物件
      targetLangs.forEach(lang => {
        const index = langIndices[lang];
        if (index === -1) return; // 找不到該語言欄位

        const value = values[index];
        if (!value) return; // 跳過空值

        // 確保每一層級都存在
        if (!results[lang][category]) {
          results[lang][category] = {};
        }

        if (section) {
          if (!results[lang][category][section]) {
            results[lang][category][section] = {};
          }

          if (item) {
            results[lang][category][section][item] = value;
          } else {
            results[lang][category][section] = value;
          }
        } else {
          results[lang][category] = value;
        }
      });
    }

    // 寫入每種語言的JSON檔案，使用 LF 作為換行符
    for (const lang of targetLangs) {
      if (results[lang] && Object.keys(results[lang]).length > 0) {
        const jsonContent = JSON.stringify(results[lang], null, 2);
        // 確保JSON使用 LF 換行符
        const normalizedJson = jsonContent.replace(/\r\n/g, '\n');

        const outputFile = outputFiles[lang];
        if (outputFile) {
          fs.writeFileSync(outputFile, normalizedJson, 'utf8');
          console.log(`✅ 產生 ${lang} 檔案: ${outputFile}`);
        }
      }
    }
  } catch (error) {
    console.error('❌ 轉換失敗:', error);
    process.exit(1);
  }
}

/**
 * 確保輸出目錄存在
 */
function ensureDirectoryExists(filePath) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * 主函式
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(`
用法:
  JSON → CSV: 
    node i18n-converter.js <json-file> <csv-file> [source-lang]
    
  多個JSON → CSV: 
    node i18n-converter.js --merge <input-dir> <csv-file> [lang1,lang2,...]
    
  CSV → JSON (所有語言): 
    node i18n-converter.js --csv2json <csv-file> <output-dir>
    
  CSV → JSON (指定語言): 
    node i18n-converter.js --csv2json <csv-file> <output-dir> <lang1,lang2,...>
    
範例:
  node i18n-converter.js public/lang/en-US.json public/i18n-translation.csv
  node i18n-converter.js public/lang/zh-TW.json public/i18n-translation.csv zh-TW
  node i18n-converter.js --merge public/lang/ public/i18n.csv
  node i18n-converter.js --merge public/lang/ public/i18n.csv zh-TW,en-US
  node i18n-converter.js --csv2json public/i18n-translation.csv public/lang/
  node i18n-converter.js --csv2json public/i18n-translation.csv public/lang/ zh-TW,en-US
    `);
    process.exit(1);
  }

  if (args[0] === '--merge') {
    // 多個JSON合併為CSV模式
    const inputDir = args[1];
    const csvFile = args[2];

    // 檢查是否指定了特定語言
    let targetLangs = SUPPORTED_LANGUAGES;
    if (args[3]) {
      targetLangs = args[3].split(',').filter(lang => SUPPORTED_LANGUAGES.includes(lang));
      if (targetLangs.length === 0) {
        console.error('❌ 錯誤: 未提供有效的目標語言');
        process.exit(1);
      }
    }

    ensureDirectoryExists(csvFile);
    convertMultipleJSONToCSV(inputDir, csvFile, targetLangs);
  } else if (args[0] === '--csv2json') {
    // CSV轉JSON模式
    const csvFile = args[1];
    const outputDir = args[2] || path.dirname(csvFile);

    ensureDirectoryExists(outputDir);

    // 準備輸出檔案路徑
    const outputFiles = {};
    SUPPORTED_LANGUAGES.forEach(lang => {
      outputFiles[lang] = path.join(outputDir, `${lang}.json`);
    });

    // 檢查是否指定了特定語言
    let targetLangs = SUPPORTED_LANGUAGES;
    if (args[3]) {
      targetLangs = args[3].split(',').filter(lang => SUPPORTED_LANGUAGES.includes(lang));
      if (targetLangs.length === 0) {
        console.error('❌ 錯誤: 未提供有效的目標語言');
        process.exit(1);
      }
    }

    convertCSVToJSON(csvFile, outputFiles, targetLangs);
  } else {
    // JSON轉CSV模式
    const jsonFile = args[0];
    const csvFile = args[1];
    const sourceLang = args[2] || 'en-US';

    if (!SUPPORTED_LANGUAGES.includes(sourceLang)) {
      console.error(`❌ 錯誤: 不支援的來源語言 "${sourceLang}"`);
      console.error(`支援的語言: ${SUPPORTED_LANGUAGES.join(', ')}`);
      process.exit(1);
    }

    ensureDirectoryExists(csvFile);
    convertJSONToCSV(jsonFile, csvFile, sourceLang);
  }
}

// 執行主函式
main();
