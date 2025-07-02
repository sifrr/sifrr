export { getJestConfig } from './jest';
export { getPlaywrightConfigOptions } from './playwright';

export function getCliArg(name: string) {
  const argi = Math.max(process.argv.indexOf(`--${name}`), process.argv.indexOf(`-${name[0]}`));
  if (argi !== -1) {
    return process.argv[argi + 1];
  }
  return undefined;
}
