# Hono + Vue 3 + TypeScript + Vite

This template should help get you started developing with Hono and Vue 3 and TypeScript in Vite. The template uses Vite & Vue 3 from a starting boilerplate project.

## Install & run
You can use any build tool (npm, yarn...), but pnpm is recommended here:
```
pnpm install

# Run in dev mode (both client & server)
pnpm dev

# Build the project for deploy
pnpm build

# Run for production mode (it uses ts-node at the moment)
pnpm start
```
You should be able to check: `http://localhost:3000/`.


## Steps to reproduce:

Here is a summary of the steps to re-produce this repo:

### 1. Set Up the Project
Initialize a new `Vite` project with Vue 3:
```bash
pnpm create vite@latest hono-vue3-vite
cd hono-vue3-vite
pnpm install
pnpm run dev
```
Follow the steps suggested in the command line by choosing this template: `Vue`, `TypeScript`.

At this point, you should have a Vite project running with Vue 3 on TypeScript.

### 2. Install Hono and Necessary Packages
Next, we need to add Hono and relevant packages to our project.

```bash
pnpm i cross-env hono @hono/node-server @hono/vite-dev-server
# devDepenencies:
pnpm i -D @types/node ts-node
```

### 3. Configure Vite
Modify `vite.config.ts` to include the Hono plugin to enable hot module reloading and other features:

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import devServer, { defaultOptions } from '@hono/vite-dev-server'

export default defineConfig({
  server: {
    port: process.env['PORT']? parseInt(process.env['PORT'], 10) : 3000
  },
  build: {
    outDir: 'dist/'
  },
  plugins: [
    vue(),
    devServer({
        entry: "./src/server.ts",
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
```

### 4. Set Up Hono Server
Create `./src/server.ts` in your project folder to set up Hono server and serve static files:

```ts
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFile } from 'node:fs/promises'

const isProd = process.env['NODE_ENV'] === 'production'
const html = await readFile(isProd ? 'dist/index.html' : 'index.html', 'utf8')

const app = new Hono()
  .use('/*', serveStatic({ root: isProd ? 'dist/' : './' }))
  .use('/assets/*', serveStatic({ root: isProd ? 'dist/assets' : './' }))
  .use('/dist/*', serveStatic({ root: 'dist/' }))
  .get('/*', c => c.html(html))

export default app

if (isProd) {
  serve({ ...app, port: process.env['PORT']? parseInt(process.env['PORT'], 10) : 3000 }, info => {
    console.log(`Listening on http://localhost:${info.port}`)
  })
}
```

### 5. Organize Project Structure
Ensure you have a clean and organized project structure. Here is a recommended structure:

```
hono-vue3-vite/
  ├── dist/
  ├── src/
  │   ├── assets/
  │   |    ├── vue.vue
  │   ├── components/
  │   |    ├── HelloWorld.vue
  │   ├── App.vue
  │   ├── main.ts
  │   ├── server.ts
  │   ├── style.css
  ├── public/
  │   ├── vite.svg
  ├── vite.config.ts
  ├── index.html
  ├── tsconfig.json
  └── package.json
```

### 6. Update Vue entry file if needed
Basically don't need to touch `main.ts`, unless you gonna add more depdencies (pinia, vue-router...).

### 7. Update HTML Template
Ensure the HTML template in `index.html` is referencing the correct script source at `src` attribute:

```html
...
  <script type="module" src="/src/main.ts"></script>
...
```

### 8. Hot Module Reload Configuration
For hot module reloading, you might need to inject the Vite client script manually inside `server.ts` during development:

```ts
if (!isProd) {
  html = html.replace('<head>', `
  <script type="module" src="/@vite/client"></script>
  `)
}
```
You can place these lines at the bottom of your `server.ts` file.

### 9. Finalizing the Hono Server Configuration

Ensure `server.ts` serves the HTML correctly:

```ts
const app = new Hono()
  // Add or remove static routes as you need
  .use('/assets/*', serveStatic({ root: isProd ? 'dist/' : './' }))
  .get('/*', async (c) => {
    return c.html(html) // for html
    // return c.text(html) // for plain/text
    // return c.json(html) // for the API
  })
```

### 10. Troubleshooting:

In case you're experiencing this error:

```
Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/html". Strict MIME type checking is enforced for module scripts per HTML spec.
```

This error occurs because the server response is an HTML document instead of the expected JavaScript module. This typically happens if the route setup in your server configuration sends the wrong MIME type or file.

#### Ensure to do the following checks:

1. **Correct MIME Type for JavaScript Modules:
**
Ensure that all JavaScript files are served with the correct Content-Type header `application/javascript`.

2. **Use the Correct Response Method in Hono:**

Update your Hono server to ensure that JavaScript files are served correctly by checking the URLs.

3. **Serve Static Files Correctly:**

Here's an updated server code snippet to address the issue:

```ts
...
const app = new Hono()
  .use('/assets/*', serveStatic({ root: isProd ? 'dist/' : './' }))
  .use('/dist/*', serveStatic({ root: isProd ? 'dist/' : './dist' }))
  .use('/@vite/*', serveStatic({ root: isProd ? 'node_modules/vite/dist' : './node_modules/vite/dist' }))
  .get('/*', async (c) => {
    return c.html(html)
  })
...
```

### Explanation of Changes:

- **Serve Static Files:** `serveStatic` is used to serve the static files such as `assets`, `dist` containing your built JS/CSS files.

- **HTML Response:** Use the `c.html(html)` method, which automatically sets the `Content-Type: text/html` header.

### Further Debugging Steps

If the problem persists:

1. Double-check that Vite generates the required `dist` folder with JavaScript files.
2. Ensure all your routes are correctly set up to serve JavaScript files and assets.
3. Check the browser's console and network tabs to see the actual requests and responses (pay attention to the paths and MIME types).
