import { SavedData } from '@/storages/types';

export function parse(data: string | undefined): SavedData | undefined {
  if (typeof data === 'undefined') return undefined;

  try {
    return JSON.parse(data) as SavedData;
  } catch (e) {
    console.error('Error parsing data from storage:', data, e);
    return undefined;
  }
}

export function stringify(data: any): string {
  return JSON.stringify(data);
}
