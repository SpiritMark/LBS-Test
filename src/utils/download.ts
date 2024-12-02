export function downloadData(data: any, filename: string, type: 'json' | 'text' | 'binary') {
  let blob: Blob;
  let extension: string;

  switch (type) {
    case 'json':
      blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      extension = '.json';
      break;
    case 'text':
      blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data)], { type: 'text/plain' });
      extension = '.txt';
      break;
    case 'binary':
      blob = new Blob([data], { type: 'application/octet-stream' });
      extension = '.bin';
      break;
  }

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}${extension}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function getDefaultFilename(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || 'response';
  } catch {
    return 'response';
  }
} 