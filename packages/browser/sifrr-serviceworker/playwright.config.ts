import { defineConfig } from '@playwright/test';
import * as pkg from '@sifrr/test-suite';

const port = !process.env.CI ? 6007 : 8006;
export default defineConfig(pkg.getPlaywrightConfigOptions(port));
