import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { readFile } from 'node:fs/promises'

const isProd = process.env['NODE_ENV'] === 'production'
let html = await readFile(isProd ? 'dist/index.html' : 'index.html', 'utf8')

console.log(`Running on prod? => ${isProd}`)

if (!isProd) {
  html = html.replace('<head>', `
  <script type="module" src="/@vite/client"></script>
  `)
}

const app = new Hono()
  .use('/*', serveStatic({ root: isProd ? 'dist/' : './' }))
  .use('/assets/*', serveStatic({ root: isProd ? 'dist/assets' : './' }))
  .use('/dist/*', serveStatic({ root: 'dist/' }))

  .get('/api', c => c.json( { count: parseInt(c.req.query('count')!) * 2} ))
  .get('/*', c => c.html(html))

app.use("*", async (c, next) => {
  c.res.headers.set("X-Powered-By", "Hono")
  await next()
})

export default app


if (isProd) {
  serve({ ...app, port: process.env['PORT']? parseInt(process.env['PORT'], 10) : 3000 }, info => {
    console.log(`Listening on http://localhost:${info.port}`)
  })
}
