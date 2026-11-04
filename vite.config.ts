import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { defineConfig, loadEnv, type Connect, type Plugin } from 'vite'
import { writeFileSync } from 'node:fs'

const root = import.meta.dirname

// Pages besides home: each has <name>/index.html and is served at /<name>/
const PAGES: string[] = []

function siteFiles(siteOrigin: string) {
  return {
    name: 'site-files',
    transformIndexHtml(html: string) {
      return html
        .replaceAll('%SITE_ORIGIN%', siteOrigin)
    },
    closeBundle() {
      const robots = `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`
      const urls = ['', ...PAGES.map((page) => `${page}/`)]
        .map((page) => `  <url>\n    <loc>${siteOrigin}/${page}</loc>\n  </url>\n`)
        .join('')
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}</urlset>\n`
      writeFileSync(path.resolve(root, 'dist/robots.txt'), robots)
      writeFileSync(path.resolve(root, 'dist/sitemap.xml'), sitemap)
    },
  }
}

// Vite's servers answer /<page> with the home page; redirect to /<page>/ like nginx does.
function pageRedirects(): Plugin {
  const redirect: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url ?? ''
    const page = PAGES.find((name) => url === `/${name}` || url.startsWith(`/${name}?`))
    if (page) {
      res.statusCode = 301
      res.setHeader('Location', url.replace(`/${page}`, `/${page}/`))
      res.end()
      return
    }
    next()
  }
  return {
    name: 'page-redirects',
    configureServer(server) {
      server.middlewares.use(redirect)
    },
    configurePreviewServer(server) {
      server.middlewares.use(redirect)
    },
  }
}

export default defineConfig(({ mode }) => {
  const developmentBuild = mode === 'development'
  const env = loadEnv(mode, process.cwd(), '')
  const siteOrigin = (env.SITE_ORIGIN || 'http://localhost:8443').replace(/\/$/, '')

  return {
    base: '/',
    build: {
      sourcemap: developmentBuild ? 'inline' : false,
      minify: !developmentBuild,
      // One HTML entry per page
      rolldownOptions: {
        input: {
          main: path.resolve(root, 'index.html'),
          ...Object.fromEntries(PAGES.map((page) => [page, path.resolve(root, `${page}/index.html`)])),
        },
      },
    },
    plugins: [react(), tailwindcss(), siteFiles(siteOrigin), pageRedirects()],
    resolve: {
      alias: {
        '@': path.resolve(root, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
      strictPort: true,
    },
    preview: {
      host: '0.0.0.0',
      port: parseInt(process.env.PORT || '8443'),
    },
  }
})
