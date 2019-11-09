/**
 * Compares two object shallowly
 * @param target target
 * @param source new value to be merged in old value
 */
function shallowEqual(target: any, source: any) {
  if (typeof target !== 'object') return target !== source;
  if (target === null || source === null) return target === source;
  for (const key in source) {
    if (!(key in target) || target[key] !== source[key]) return true;
  }
  return false;
}

export default shallowEqual;
