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

  // 移除开头的 "curl" 和多余的空格
  const command = curlCommand.trim().replace(/^curl\s+/, '');

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
      result.headers.push({ key: key.trim(), value });
    } else if (arg === '-d' || arg === '--data' || arg === '--data-raw') {
      result.data = args[++i].replace(/\\"/g, '"');
      if (!result.method) {
        result.method = 'POST';
      }
    } else if (!arg.startsWith('-') && !result.url) {
      // 解析 URL 和查询参数
      try {
        // 移除引号并解码 URL
        const cleanUrl = decodeURIComponent(arg.replace(/['"]/g, ''));
        const urlObj = new URL(cleanUrl);
        
        // 设置基本 URL（不包含查询参数）
        result.url = urlObj.origin + urlObj.pathname;
        
        // 解析查询参数
        const searchParams = new URLSearchParams(urlObj.search);
        for (const [key, value] of searchParams.entries()) {
          try {
            // 尝试解码参数值
            const decodedKey = decodeURIComponent(key);
            const decodedValue = decodeURIComponent(value);
            result.params.push({ key: decodedKey, value: decodedValue });
          } catch {
            // 如果解码失败，使用原始值
            result.params.push({ key, value });
          }
        }
      } catch (error) {
        console.error('URL parsing error:', error);
        // 如果 URL 解析失败，尝试手动解析
        const urlParts = arg.replace(/['"]/g, '').split('?');
        result.url = urlParts[0];
        
        if (urlParts.length > 1) {
          const queryString = urlParts[1];
          const params = queryString.split('&');
          for (const param of params) {
            const [key, value = ''] = param.split('=').map(part => {
              try {
                return decodeURIComponent(part);
              } catch {
                return part;
              }
            });
            if (key) {
              result.params.push({ key, value });
            }
          }
        }
      }
    }
  }

  // 打印解析结果用于调试
  console.log('Parsed curl command:', {
    method: result.method,
    url: result.url,
    params: result.params,
    headers: result.headers,
    data: result.data
  });

  return result;
}