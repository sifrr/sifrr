import { SavedData } from '../storages/types';

function parseGetData(
  original: SavedData | undefined,
  onExpire?: () => unknown
): SavedData['value'] | undefined;
function parseGetData(original: undefined, onExpire?: () => unknown): undefined;
function parseGetData(original: SavedData | undefined, onExpire?: () => unknown) {
  if (!original) return undefined;

  const { createdAt, ttl } = original;

  if (ttl && Date.now() - createdAt > ttl) {
    onExpire?.();
    return;
  }
  return original.value;
}

export const parseSetValue = (value: any, ttl: number = 0): SavedData => {
  return {
    value,
    ttl,
    createdAt: Date.now()
  };
};

export { parseGetData };
