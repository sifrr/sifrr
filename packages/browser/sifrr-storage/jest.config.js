import { getJestConfig } from '@sifrr/test-suite';
import config from './tsconfig.json' with { type: 'json' };

export default getJestConfig(config.compilerOptions.paths);
