var request = require('request').defaults(
    {json: true
    , headers:{'user-agent':'go-stats', 'Authorization': 'token '+process.env.GHTOKEN}
    })
  , cheerio = require('cheerio')
  , level = require('level')
  , repodb = level('./repodb', {valueEncoding:'json'})
  , noop = function () {}
  ;

var urls = []
 , errors = {}
 ;

repodb.createReadStream()
.on('data', function (row) {
  if (row.value.parent) return
  urls.push(row.key)
})
.on('end', function () {
  function _get () {
    var id = urls.shift()
    if (!id) return
    var u = id.replace('github.com/', 'api.github.com/repos/')
    request.get(u, function (e, resp, body) {
      if (e) {
        console.error(e)
        return _get()
      }
      if (resp.statusCode !== 200) {
        if (!errors[resp.statusCode]) errors[resp.statusCode] = 0
        errors[resp.statusCode] += 1
        return _get()
      }
      var parent
      if (body.fork) {
        parent = body.parent.html_url
      } else {
        parent = 1
      }
      console.log(id, parent)
      repodb.put(id, {parent:parent}, noop)
      _get()
    })
  }
  _get()
  _get()
  _get()
  _get()
})
process.on('exit', function () {
  console.log(errors)
})
