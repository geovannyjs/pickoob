const fs = require('fs')
const http = require('http')
const Router = require('router')
const finalhandler = require('finalhandler')
const querystring = require('querystring')

const mongo = require('mongodb')

const sanitize = require('../lib/string/sanitize')

// templates
const wrapper = require('./templates/components/wrapper')

const bookList = require('./templates/book/list')
const bookView = require('./templates/book/view')

const authorList = require('./templates/author/list')
const authorView = require('./templates/author/view')

const languageList = require('./templates/language/list')
const languageView = require('./templates/language/view')

const shelfList = require('./templates/shelf/list')
const shelfView = require('./templates/shelf/view')

const subjectList = require('./templates/subject/list')
const subjectView = require('./templates/subject/view')


// functions
const queryStringAsObject = (req) => querystring.parse(req.url.split(/\?/)[1])

const buildPaging = (col, req) => col.countDocuments().then(count => {
  let page = parseInt(queryStringAsObject(req).page) || 1
  return {
    page,
    rows: count,
    limit: 10,
    skip: (page - 1) * 10
  }
})

var pageNumber = 1

let changePage = (currentPage) => `<a href="/page/${++currentPage}">Proxima</a>`
let changePageSearchFirst = (currentPage, goal) => `<a href="/search/page/${++currentPage}/${goal}">Proxima</a>`


//DB connection
mongo.MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
  
  const db = client.db('pickoob')
  const authorColl = db.collection('author')
  const bookColl = db.collection('book')
  const languageColl = db.collection('language')
  const shelfColl = db.collection('shelf')
  const subjectColl = db.collection('subject')

  // make a router with out special options
  var router = Router()

  var server = http.createServer(function onRequest(req, res) {
    router(req, res, finalhandler(req, res))
  })

  // serving static files for when in dev mode
  // export NODE_ENV=dev
  if(process.env.NODE_ENV === 'dev') {
    router.get('/static/*', (req, res) => {

      fs.readFile(__dirname + req.url, function (err,data) {
        if(err) {
          res.writeHead(404)
          res.end(JSON.stringify(err))
        } else {
          res.writeHead(200)
          res.end(data)
        }
      })

    })
  }

  router.get('/', (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    //=============== Pegar nome das collections
    var contagem = 0
    pageNumber = 1 //ao voltar para a tela inicial deve-se a contagem da pagina deve voltar a 1
    client.db(dbName).listCollections().toArray().then(data => {
      data.forEach(b => client.db(dbName).collection(b.name).count().then(quantity => { 
      
        contagem = contagem + quantity
        console.log(contagem)
        return contagem
      }))
    })

    Promise.all([
      shelfColl.find({}).skip(0).limit(10).toArray(),
      authorColl.find({}).skip(0).limit(10).toArray(),
      bookColl.find({}).skip(0).limit(10).toArray()
    ]).then((items) =>{
      let firstResult = items[0].map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('')
      let secondResult = items[1].map(x => `<a href="/author/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('')
      let thirdResult = items[2].map(x => `<a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a><br>`).join('')
      let Result = firstResult + secondResult + thirdResult
      return Result
    })
    .then(content => res.end(wrapper({ content : content + changePage(pageNumber) })))

  })

  router.get('/authors', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    buildPaging(authorColl, req).then(paging => {
      authorColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(authors => res.end(authorList({ authors, paging })))
    })
  })

  router.get('/author/:name/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    authorColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {})
    .then(x => res.end(authorView(x)))
  })

  router.get('/books', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    buildPaging(bookColl, req).then(paging => {
      bookColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(books => res.end(bookList({ books, paging })))
    })
  })

  router.get('/book/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    bookColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {})
      .then(x => res.end(bookView(x)))
  })

  router.get('/languages', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    buildPaging(languageColl, req).then(paging => {
      languageColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(languages => res.end(languageList({ languages, paging })))
    })
  })

  router.get('/language/:name/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    languageColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {})
    .then(x => res.end(languageView(x)))
  })

  router.get('/shelves', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    buildPaging(shelfColl, req).then(paging => {
      shelfColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(shelves => res.end(shelfList({ shelves, paging })))
    })
  })

  router.get('/shelf/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    shelfColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {}).then(x => {
      res.write(shelfView(x))
      res.end()
    })
  })

  router.get('/subjects', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    buildPaging(subjectColl, req).then(paging => {
      subjectColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(subjects => res.end(subjectList({ subjects, paging })))
    })
  })

  router.get('/subject/:name/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    subjectColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {})
      .then(x => res.end(subjectView(x)))
  })

  router.get('/search', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    console.log(Object.values(querystring.parse(req.originalUrl)))
    let searchGoal = Object.values(querystring.parse(req.originalUrl))

    pageNumber = 0

    Promise.all([
      shelfColl.find({name: {$regex: new RegExp(searchGoal)}}).skip(parseInt(pageNumber) * 10).limit(10).toArray(),
      authorColl.find({name: {$regex: new RegExp(searchGoal)}}).skip(parseInt(pageNumber) * 10).limit(10).toArray(),
      bookColl.find({title: {$regex: new RegExp(searchGoal)}}).skip(parseInt(pageNumber) * 10).limit(10).toArray()
    ]).then((items) =>{
      let firstResult = items[0].map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('')
      let secondResult = items[1].map(x => `<a href="/author/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('')
      let thirdResult = items[2].map(x => `<a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a><br>`).join('')
      let Result = firstResult + secondResult + thirdResult
      return Result
    })
    .then(content => res.end(wrapper({ content : content + changePageSearchFirst(pageNumber, searchGoal[0]) })))

  })


  /*
  router.get('/search/page/:pageNumber/:goal', function(req, res) {
    res.statusCode = 200
    res.setHeader('Content-type', 'text/html; charset = utf-8')

    client.db(dbName).collection("book").find({name: {$regex: new RegExp(req.params.goal)}}).skip((parseInt(req.params.pageNumber)*10)).limit(10).toArray()
    .then(items => items.map(x => `<a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a><br>`).join(''))
    .then(content => {
      res.write(wrapper({ content : content + changePageSearch(parseInt(req.params.pageNumber),req.params.goal) }))
      res.end()
  })
  })
  */

  // make our http server listen to connections
  server.listen(8080)

})