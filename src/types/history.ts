export interface RequestHistory {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: { key: string; value: string }[];
  params: { key: string; value: string }[];
  bodyType: 'none' | 'json' | 'form-data';
  jsonBody?: string;
  formData?: { key: string; value: string }[];
  createdAt: number;
  updatedAt: number;
} 