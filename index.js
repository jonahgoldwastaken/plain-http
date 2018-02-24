const http = require('http')
const fs = require('fs')
const path = require('path')
const mt = require('mime-types')

const routeRegExp = new RegExp(/\/$/)

const onnotfound = (url, res) => {
    res.statusCode = 404
    if (mt.lookup(url) == 'text/html')
        fs.readFile(path.join(__dirname, '/404.html'), (err, buf) => {
            if (err) throw err
            buf.toString()
            res.end(buf)
        })
    else res.end()
}

const onrequest = (req, res) => {
    if (routeRegExp.test(req.url) || !mt.lookup(req.url))
        req.url += '/index.html'

    fs.readFile(path.join(__dirname, req.url), (err, buf) => {
        if (err) {
            onnotfound(req.url, res)
            console.error(err)
            return
        }

        buf.toString()
        
        res.statusCode = 200
        res.setHeader('Content-Type', mt.lookup(req.url))
        res.end(buf)
    })
}

http.createServer(onrequest).listen(8000)