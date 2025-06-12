import { defineConfig } from '@playwright/test';
import * as pkg from '@sifrr/test-suite';

const port = !process.env.CI ? 6006 : 8003;
export default defineConfig(await pkg.getPlaywrightConfigOptions(port));
