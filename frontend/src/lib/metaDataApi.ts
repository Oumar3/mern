import { MetaData } from "../types/indicator";
import api from "../lib/api";

export async function fetchMetaDataList(): Promise<MetaData[]> {
  const res = await api.get("/meta-data");
  return res.data;
}

export async function fetchMetaDataById(id: string): Promise<MetaData> {
  const res = await api.get(`/meta-data/${id}`);
  return res.data;
}

export async function createMetaData(data: Partial<MetaData>): Promise<MetaData> {
  const res = await api.post("/meta-data", data);
  return res.data;
}

export async function updateMetaData(id: string, data: Partial<MetaData>): Promise<MetaData> {
  const res = await api.put(`/meta-data/${id}` , data);
  return res.data;
}

export async function deleteMetaData(id: string): Promise<void> {
  await api.delete(`/meta-data/${id}`);
}

export async function fetchMetaDataOptions(): Promise<MetaData[]> {
  const res = await api.get("/meta-data/options");
  return res.data;
}

export async function importMetaDataFromExcel(file: File): Promise<{
  message: string;
  imported: number;
  errors: Array<{
    row?: number;
    error: string;
    data?: Record<string, unknown>;
  }>;
  data: MetaData[];
}> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await api.post('/meta-data/import-excel', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return res.data;
}
