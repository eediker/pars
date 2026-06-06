const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  outfile: 'dist/pars.js',
  minify: true, // For extreme speed
  external: ['esbuild'], // Don't bundle esbuild
  logLevel: 'info',
}).catch(() => process.exit(1));
