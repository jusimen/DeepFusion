import * as esbuild from 'esbuild';
import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const isWatch = process.argv.includes('--watch');

// Copyright
const currentYear = new Date().getFullYear();
const releaseYear = 2022;

// Banner
const bannerData = [
  `${pkg.name}`,
  `v${pkg.version}`,
  `${pkg.homepage}`,
  `(c) ${releaseYear}${currentYear === releaseYear ? '' : '-' + currentYear} ${pkg.author}`,
  `${pkg.license} license`
];

// Custom plugins
const buildPlugin = {
  name: 'watch-plugin',
  setup(build) {
    const options = build.initialOptions;
    const { entryPoints, outfile } = options;

    build.onEnd(result => {
      const statusEmoji = result.errors.length ? '🔴' : '🟢';

      // eslint-disable-next-line no-console
      console.log(`${statusEmoji} esbuild: ${entryPoints} => ${outfile}`);
    });
  }
};

// Config
// =============================================================================
const baseConfig = {
  entryPoints: ['src/index.js'],
  bundle: true,
  banner: {
    js: `/*!\n * ${bannerData.join('\n * ')}\n */`
  },
  legalComments: 'inline',
  plugins: [buildPlugin],
  target: ['esnext'],
  outfile: 'dist/mergekit.EXT'
};

const cjs = {
  ...baseConfig,
  platform: 'node',
  format: 'cjs',
  outfile: baseConfig.outfile.replace(/\.EXT$/, '.cjs')
};

const esm = {
  ...baseConfig,
  format: 'esm',
  outfile: baseConfig.outfile.replace(/\.EXT$/, '.esm.js')
};

const esmMinified = {
  ...esm,
  minify: true,
  legalComments: 'none',
  sourcemap: true,
  outfile: baseConfig.outfile.replace(/\.EXT$/, '.esm.min.js')
};

// Build
// =============================================================================
// eslint-disable-next-line no-console
console.log(`Building${isWatch ? ' and watching' : ''} JavaScript...\n`);

[cjs, esm, esmMinified].forEach(async config => {
  if (isWatch) {
    const ctx = await esbuild.context(config);

    await ctx.watch();
  } else {
    esbuild.build(config);
  }
});
