export const objConst = {}.constructor;

export const isValidJson = (payload: any): payload is object => {
  if (payload instanceof FormData) return false;
  if (payload instanceof Blob) return false;
  if (payload instanceof ReadableStream) return false;
  if (typeof window !== 'undefined' && payload instanceof AudioBufferSourceNode) return false;
  if (payload instanceof URLSearchParams) return false;
  return payload && (payload.constructor === objConst || Array.isArray(payload));
};

export const isObject = (payload: any): payload is object => {
  return payload && (payload.constructor === objConst || Array.isArray(payload));
};
