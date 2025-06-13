import { getJestConfig } from '@sifrr/test-suite';
import { compilerOptions } from './tsconfig.json';

export default getJestConfig(compilerOptions.paths);
