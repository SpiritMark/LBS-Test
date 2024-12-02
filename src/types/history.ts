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
  timestamp?: number;
  response?: {
    status: number;
    data: any;
    time: number;
  };
  createdAt: number;
  updatedAt: number;
} 