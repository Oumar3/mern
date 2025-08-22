import { UniteDeMesure } from "../types/indicator";
import api from "./api";

export async function fetchUniteDeMesureList(): Promise<UniteDeMesure[]> {
  const res = await api.get("/unites-de-mesure");
  return res.data;
}

export async function fetchUniteDeMesureById(id: string): Promise<UniteDeMesure> {
  const res = await api.get(`/unites-de-mesure/${id}`);
  return res.data;
}

export async function createUniteDeMesure(data: Partial<UniteDeMesure>): Promise<UniteDeMesure> {
  const res = await api.post("/unites-de-mesure", data);
  return res.data;
}

export async function updateUniteDeMesure(id: string, data: Partial<UniteDeMesure>): Promise<UniteDeMesure> {
  const res = await api.put(`/unites-de-mesure/${id}`, data);
  return res.data;
}

export async function deleteUniteDeMesure(id: string): Promise<void> {
  await api.delete(`/unites-de-mesure/${id}`);
}

export async function fetchUniteDeMesureOptions(): Promise<UniteDeMesure[]> {
  const res = await api.get("/unites-de-mesure/options");
  return res.data;
}
