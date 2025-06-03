import createTemplate from '@/template/create';
import createUniqueString from '../ustring';

export default function styled<T>(str: TemplateStringsArray, ...substitutions: any[]) {
  const newClass = createUniqueString(8);
  const raw: string[] & { raw?: readonly string[] } = ['.', ' {', ...str.raw, '}'];
  raw.raw = raw;
  return {
    css: createTemplate<T>(<TemplateStringsArray>raw, newClass, '', ...substitutions, ''),
    className: newClass
  };
}
