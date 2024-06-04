import { build, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devServer, { defaultOptions } from '@hono/vite-dev-server'

export default defineConfig({
  server: {
    port: process.env['PORT']?? 3000, // you can change it to your preferred port if needed
  },
  // This is the default
  // build: {
  //   outDir: 'dist/'
  // },
  plugins: [
    vue(),
    devServer({
        entry: "server.ts",
        exclude: defaultOptions.exclude.concat([
          /.*\.tsx?($|\?)/,
          /.*\.vue$/,
          /.*\.(s?css|less)($|\?)/,
          /.*\.(jpg|svg|png)($|\?)/,
          /^\/@.+$/,
          /^\/favicon\.ico$/,
          /^\/(public|assets|static)\/.+/,
          /^\/node_modules\/.*/
        ]),
        injectClientScript: false, // this option is buggy, disable it and inject the code manually
    })
  ],
})
