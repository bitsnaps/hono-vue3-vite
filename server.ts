import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFile } from 'node:fs/promises'

const isProd = process.env['NODE_ENV'] === 'production'
let html = await readFile(isProd ? 'dist/index.html' : 'index.html', 'utf8')


if (!isProd) {
  html = html.replace('<head>', `
  <script type="module" src="/@vite/client"></script>
  `)
}

const app = new Hono()
  .use('/assets/*', serveStatic({ root: isProd ? 'dist/' : './' }))
  .get('/api', c => c.json( {count: c.req.queries('count')[0]} ))
  .get('/*', c => c.html(html))

// app.use("*", async (c, next) => {
//   c.res.headers.set("X-Powered-By", "Hono")
//   await next()
// })

export default app

if (isProd) {
  serve({ ...app, port: process.env['PORT']?? 3000 }, info => {
    console.log(`Listening on http://localhost:${info.port}`)
  })
}
