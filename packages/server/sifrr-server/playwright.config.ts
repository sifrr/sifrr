import { defineConfig } from '@playwright/test';
import * as pkg from '@sifrr/test-suite';

const port = !process.env.CI ? 6006 : 8007;
export default defineConfig(pkg.getPlaywrightConfigOptions(port));
