import css from './css';
import createUniqueString from '../ustring';

export default function styled(str: TemplateStringsArray, ...substitutions: any[]) {
  const newClass = createUniqueString(8);
  const raw: string[] & { raw?: readonly string[] } = ['.', ' {', ...str.raw, '}'];
  raw.raw = raw;
  return {
    css: css(<TemplateStringsArray>raw, newClass, '', ...substitutions, ''),
    className: newClass
  };
}
