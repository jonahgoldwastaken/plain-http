const http = require('http')

const onrequest = (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end(`<h1>${req.url}</h1>\n`)
}

http.createServer(onrequest).listen(8000)