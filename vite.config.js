import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative base path so the built assets are correctly loaded
  // regardless of whether it's hosted at the root or a subpath on GitHub Pages.
  base: './',
});
