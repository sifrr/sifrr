import { defineConfig } from '@playwright/test';
import pkg from '@sifrr/test-suite';

export default defineConfig(pkg.playwrightConfigOptions);
