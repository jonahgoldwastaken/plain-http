const http = require('http')
const fs = require('fs')
const path = require('path')
const mimeTypes = require('mime-types')

// Mimes for files that are allowed to be opened from the sitemap view
const allowedMimes = ['text/html', 'text/css', 'application/javascript', 'image/x-icon', 'image/jpeg', 'image/png']

const routeRegExp = new RegExp(/\/$/)

const sitemap = (dir, list) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>${dir}</title>
    </head>
    <body>
        <h1>Contents inside the ${dir} folder</h1>
        <ul>
            ${list.map(file => `
                <li>
                    <a href="${dir != '/' ? dir + '/' : dir}${file}">${file}</a>
                </li>
            `).join('')}
        </ul>
    </body>
    </html>
`

const onnotfound = (url, res) =>
    fs.readFile(path.join(__dirname, '/404.html'), (err, buf) => {
        if (err) throw err

        res.statusCode = 404
        res.setHeader('Content-Type', 'text/html')
        res.end(buf)
    })

const showsitemap = (url, res) => {
    const dir = path.dirname(url) == '//' ? '/' : path.dirname(url)
    fs.readdir(path.join(__dirname, dir), (err, list) => {
        if (err) {
            onnotfound(url, res)
            return
        }
        
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html')
        res.end(sitemap(dir, list))
    })
}

const onrequest = (req, res) => {
    if (routeRegExp.test(req.url) || !mimeTypes.lookup(req.url))
        req.url += '/index.html'

    res.mimeType = mimeTypes.lookup(req.url)

    if (!allowedMimes.includes(res.mimeType)) {
        res.statusCode = 403
        res.end()
        return
    }

    fs.readFile(path.join(__dirname, req.url), (err, buf) => {
        if (err) {
            if (path.basename(req.url) != 'index.html')
                onnotfound(req.url, res)
            else
                showsitemap(req.url, res)
            return
        }
        
        res.statusCode = 200
        res.setHeader('Content-Type', res.mimeType)
        res.end(buf)
    })
}

http.createServer(onrequest).listen(8000)