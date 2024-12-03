interface ParsedCurl {
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  params: { key: string; value: string }[];
  data?: string;
}

export function parseCurl(curlCommand: string): ParsedCurl {
  const result: ParsedCurl = {
    method: 'GET',
    url: '',
    headers: [],
    params: [],
  };

  // 移除开头的 "curl" 和多余的空格，处理多行命令
  const command = curlCommand
    .trim()
    .replace(/^curl\s+/, '')
    .replace(/\\\n\s*/g, ''); // 处理多行命令

  // 分割命令为参数数组，保持引号内的内容完整
  const args: string[] = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < command.length; i++) {
    const char = command[i];
    if ((char === '"' || char === "'") && command[i - 1] !== '\\') {
      if (!inQuote) {
        inQuote = true;
        quoteChar = char;
      } else if (char === quoteChar) {
        inQuote = false;
      } else {
        current += char;
      }
    } else if (char === ' ' && !inQuote) {
      if (current) {
        args.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current) {
    args.push(current);
  }

  // 解析参数
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '-X' || arg === '--request') {
      result.method = args[++i];
    } else if (arg === '-H' || arg === '--header') {
      const header = args[++i];
      const [key, ...valueParts] = header.split(':');
      const value = valueParts.join(':').trim();
      // 移除引号
      const cleanValue = value.replace(/^["'](.*)["']$/, '$1');
      result.headers.push({ key: key.trim(), value: cleanValue });
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw') {
      let data = args[++i];
      // 移除外层引号
      data = data.replace(/^["'](.*)["']$/, '$1');
      // 如果是 JSON 字符串，保持原样
      if (data.startsWith('{') || data.startsWith('[')) {
        result.data = data;
      } else {
        // 否则假设是 form 数据
        result.data = data;
      }
      if (!result.method) {
        result.method = 'POST';
      }
    } else if (!arg.startsWith('-') && !result.url) {
      // 解析 URL 和查询参数
      try {
        // 移除引号并解码 URL
        const cleanUrl = arg.replace(/^["'](.*)["']$/, '$1');
        const urlObj = new URL(cleanUrl);
        
        // 设置基本 URL（不包含查询参数）
        result.url = urlObj.origin + urlObj.pathname;
        
        // 解析查询参数
        const searchParams = new URLSearchParams(urlObj.search);
        for (const [key, value] of searchParams.entries()) {
          result.params.push({ key, value });
        }
      } catch (error) {
        console.error('URL parsing error:', error);
        result.url = arg.replace(/^["'](.*)["']$/, '$1');
      }
    }
  }

  // 如果没有找到 Content-Type header，但有 JSON 数据，添加 JSON Content-Type
  if (result.data && result.data.startsWith('{') && 
      !result.headers.some(h => h.key.toLowerCase() === 'content-type')) {
    result.headers.push({
      key: 'Content-Type',
      value: 'application/json'
    });
  }

  return result;
}