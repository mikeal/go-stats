var request = require('request').defaults({headers:{'user-agent':'go-stats'}})
  , cheerio = require('cheerio')
  , level = require('level')
  , godb = level('./godb', {valueEncoding:'json'})
  , repodb = level('./repodb', {valueEncoding:'json'})
  , noop = function () {}
  ;

var pkgs = 0
  , errs = 0
  , apps = 0
  , domains = {}
  , repos = new Set()
  ;

function xIndexOf (Val, Str, x)  {
  // http://webmisterradixlecti.blogspot.com/2012/10/javascript-secondindexof-or-xindexof.html
   if (x <= (Str.split(Val).length - 1)) {
     Ot = Str.indexOf(Val);
     if (x > 1) { for (var i = 1; i < x; i++) { var Ot = Str.indexOf(Val, Ot + 1) } }
     return Ot;
   } else { return undefined }
 }

godb.createReadStream()
.on('data', function (row) {
  var doc = row.value;
  if (doc.pkg) pkgs += 1
  else if (doc.dirs) apps += 1
  else errs += 1

  if (doc.pkg) {
    var p = doc.pkg
      , domain
      ;
    if (p.startsWith('http://')) {
      domain = p.slice('http://'.length, p.indexOf('/', 'http://'.length))
    } else if (p.startsWith('https://')) {
      domain = p.slice('https://'.length, p.indexOf('/', 'https://'.length))
    }
    if (!domains[domain]) domains[domain] = 0
    domains[domain] += 1

    if (domain === 'github.com') {
      var i = xIndexOf('/', p, 5)
      var repo = p.slice(0, i)
      repos.add(repo)
    }
  }
})
.on('end', function () {
  console.log('pkgs', pkgs, 'apps', apps, 'errors', errs, 'total', pkgs + errs + apps)
  console.log(domains)
  console.log('repos', repos.size)

  var r = repos.values()
  var names = new Set()
  repos.forEach(function (u) {
    var name = u.slice(u.lastIndexOf('/'))
    names.add(name)
    repodb.get(u, function (e) {
      if (e) repodb.put(u, {}, noop)
    })
  })
  console.log('names', names.size)
})
