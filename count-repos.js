var request = require('request').defaults(
    {json: true
    , headers:{'user-agent':'go-stats', 'Authorization': 'token '+process.env.GHTOKEN}
    })
  , cheerio = require('cheerio')
  , level = require('level')
  , repodb = level('./repodb', {valueEncoding:'json'})
  , noop = function () {}
  ;

var repos = new Set()
  , rows = 0
  , notfounds = 0
  ;

repodb.createReadStream()
.on('data', function (row) {
  rows += 1
  var r
  if (row.value.parent === 1) {
    r = row.key
  } else if (row.value.parent) {
    r = row.value.parent
  } else {
    notfounds += 1
    console.log('No data, probably a 404 on github', row.key)
    return
  }
  repos.add(r)
})
.on('end', function () {
  console.log('Total', repos.size)
  console.log('Rows', rows)
  console.log('Not Founds', notfounds)
})
