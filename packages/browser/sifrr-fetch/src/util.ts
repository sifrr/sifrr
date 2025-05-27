const objConst = {}.constructor;

export const isObject = (payload: any): payload is object => {
  return payload && (payload.constructor === objConst || Array.isArray(payload));
};
