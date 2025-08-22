import { Programme } from '../types/indicator';
import api from './api';

export async function fetchProgrammeOptions(): Promise<Programme[]> {
  const res = await api.get('/programmes');
  return res.data;
}
