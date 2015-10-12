var request = require('request').defaults({headers:{'user-agent':'go-stats'}})
  , cheerio = require('cheerio')
  , level = require('level')
  , db = level('./godb', {valueEncoding:'json'})
  , noop = function () {}
  ;

function parseIndex () {
  request('https://godoc.org/-/index', function (e, resp, body) {
    var $ = cheerio.load(body)
    $('tbody tr td a').each(function (elem) {
      var id = this.attribs.href
      db.get(id, function (e) {
        if (e) db.put(id, {}, noop)
      })
    })
  })
}

function getPage (id, cb) {
  console.log('https://godoc.org'+id)
  request('https://godoc.org'+id, function (e, resp, body) {
    try {
      var $ = cheerio.load(body)
    } catch (e) {
      return db.put(id, {error:e.message}, cb)
    }

    var elem = $('h4#pkg-files a')
    if (elem.length == 0) {
      var obj = {pkg:null, dirs:[]}
      $('tbody tr td a').each(function (elem) {
        console.log('dir', this.attribs.href)
        obj.dirs.push(this.attribs.href)
      })
      db.get(id, function (e, data) {
        data.pkg = obj.pkg
        data.dirs = obj.dirs
        db.put(id, data, cb)
      })
    } else {
      var pkg = elem.attr('href')
      console.log('pkg', pkg)
      db.get(id, function (e, data) {
        data.pkg = pkg
        db.put(id, data, cb)
      })
    }
  })
}

function getPages () {
  var keys = []
  db.createReadStream()
  .on('data', function (d) {
    if (d.value.pkg || d.value.dirs) return
    keys.push(d.key)
  })
  .on('end', function () {
    console.log('count', keys.length)
    function _do () {
      getPage(keys.shift(), _do)
    }
    _do()
    _do()
    _do()
    _do()
  })
}

// parseIndex()
getPages()
