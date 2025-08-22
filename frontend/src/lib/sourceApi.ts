import { Source } from "../types/indicator";
import api from "./api";

export async function fetchSourceList(): Promise<Source[]> {
  const res = await api.get("/sources");
  return res.data;
}

export async function fetchSourceById(id: string): Promise<Source> {
  const res = await api.get(`/sources/${id}`);
  return res.data;
}

export async function createSource(data: Partial<Source>): Promise<Source> {
  const res = await api.post("/sources", data);
  return res.data;
}

export async function updateSource(id: string, data: Partial<Source>): Promise<Source> {
  const res = await api.put(`/sources/${id}`, data);
  return res.data;
}

export async function deleteSource(id: string): Promise<void> {
  await api.delete(`/sources/${id}`);
}

export async function fetchSourceOptions(): Promise<Source[]> {
  const res = await api.get("/sources/options");
  return res.data;
}
