const fs = require('fs')
const http = require('http')
const Router = require('router')
const finalhandler = require('finalhandler')
const querystring = require('querystring')

const mongo = require('mongodb')
const R = require('ramda')

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

const buildPaging = (col, req, search) => col.countDocuments(search || {}).then(rows => {

  let page = parseInt(queryStringAsObject(req).page) || 1,
  limit = 10,
  last = parseInt(rows/limit) + ((rows % limit > 0) ? 1 : 0)
  
  return {
    page,
    first: 1,
    previous: R.max(page - 1, 1),
    next: R.min(page + 1, last),
    last,
    rows,
    limit,
    skip: (page - 1) * limit
  }
})


//DB connection
mongo.MongoClient.connect('mongodb://10.0.0.1:27017', { useUnifiedTopology: true }, (err, client) => {
  
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

    Promise.all([
      shelfColl.find({}).limit(10).toArray(),
      authorColl.find({}).limit(10).toArray(),
      bookColl.find({}).limit(10).toArray()
    ]).then((items) =>{
      let firstResult = items[0].map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}" title="${x.name}">${x.name}</a><br>`).join('')
      let secondResult = items[1].map(x => `<a href="/author/${sanitize(x.name)}/${x._id}" title="${x.name}">${x.name}</a><br>`).join('')
      let thirdResult = items[2].map(x => `<a href="/book/${sanitize(x.title)}/${x._id}" title="${x.title}">${x.title}</a><br>`).join('')
      let Result = firstResult + secondResult + thirdResult
      return Result
    })
    .then(content => res.end(wrapper({ content })))

  })

  router.get('/authors', (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    let search = queryStringAsObject(req).search
    let find = { name: { $regex: new RegExp(queryStringAsObject(req).search, 'i') } }

    buildPaging(authorColl, req, find).then(paging =>
      // list authors
      authorColl.find(find).skip(paging.skip).limit(paging.limit).toArray()
        .then(authors => 
          authors.map(x =>
            // for each author/contributor/illustrator get the associated books, limited to 5
            bookColl.find({ $or: [{ author: x._id }, { contributor: x._id }, { illustrator: x._id }] }).limit(5).toArray()
              // join author and book in one unique object
              .then(books => {
                return {
                  author: x,
                  books
                }
              })
          )
        )
        // we need to wait until all the results are ready  
        .then(x => Promise.all(x))
        // call the html template
        .then(rows => res.end(authorList({ rows, paging, search })))
    )
  })

  router.get('/author/:name/:id', (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    authorColl.findOne({ _id: new mongo.ObjectID(req.params.id) })
      .then(x => res.end(authorView(x)))
  })

  router.get('/books', (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    let search = queryStringAsObject(req).search
    let find = { title: { $regex: new RegExp(search, 'i') } }

    buildPaging(bookColl, req, find).then(paging => 
      bookColl.find(find).skip(paging.skip).limit(paging.limit).toArray()
        .then(books => res.end(bookList({ books, paging, search })))
    )
  })

  router.get('/book/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    bookColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {})
      .then(x => res.end(bookView(x)))
  })

  router.get('/languages', (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')

    let search = queryStringAsObject(req).search
    let find = { name: { $regex: new RegExp(queryStringAsObject(req).search, 'i') } }

    buildPaging(languageColl, req, find).then(paging =>
      // list languages
      languageColl.find(find).skip(paging.skip).limit(paging.limit).toArray()
        .then(languages => 
          languages.map(x =>
            // for each language get the associated books, limited to 5
            bookColl.find({ language: x._id }).limit(5).toArray()
              // join language and book in one unique object
              .then(books => {
                return {
                  language: x,
                  books
                }
              })
          )
        )
        // we need to wait until all the results are ready  
        .then(x => Promise.all(x))
        // call the html template
        .then(rows => res.end(languageList({ rows, paging, search })))
    )
  })

  router.get('/language/:name/:id', (req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    languageColl.findOne({ _id: new mongo.ObjectID(req.params.id) })
      .then(x => res.end(languageView(x)))
  })

  router.get('/shelves', function (req, res) {
    res.statusCode = 200
    let searchParameter = {name: {$regex: new RegExp(queryStringAsObject(req).search, 'i')}}
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    if(searchParameter){
      //same as author
      buildPaging(shelfColl, req, searchParameter).then(paging => {
        shelfColl.find(searchParameter).skip(paging.skip).limit(paging.limit).toArray()
        .then(shelves => shelves.map(x => {
          return bookColl.find({shelf: {$eq: x._id}}).limit(5).toArray()
            .then(bookPromise => {return{
              shelf: x,
              books: bookPromise
            }}
            )
        }))  
        .then((x) => Promise.all(x))
        .then(object => res.end(shelfList({ object, paging, search:((queryStringAsObject(req).search) ? queryStringAsObject(req).search : 'invERRORalid') })))
      })

    }
    else{
      //same as author
      buildPaging(shelfColl, req).then(paging => {
        shelfColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(shelves => shelves.map(x => {
          return bookColl.find({shelf: {$eq: x._id}}).limit(5).toArray()
            .then(bookPromise => {return{
              shelf: x,
              books: bookPromise
            }}
            )
        }))  
        .then((x) => Promise.all(x))
        .then(object => res.end(shelfList({ object, paging })))
      })

    }

  })

  router.get('/shelf/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    shelfColl.findOne({_id: new mongo.ObjectID(req.params.id)}, {})
      .then(x => res.end(shelfView(x)))
  })

  router.get('/subjects', function (req, res) {
    res.statusCode = 200
    let searchParameter = {name: {$regex: new RegExp(queryStringAsObject(req).search, 'i')}}
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    if(searchParameter){
      //same as author
      buildPaging(subjectColl, req, searchParameter).then(paging => {
        subjectColl.find(searchParameter).skip(paging.skip).limit(paging.limit).toArray()
        .then(subjects => subjects.map(x => {
          return bookColl.find({subject: {$eq: x._id}}).limit(5).toArray()
            .then(bookPromise => {return{
              subject: x,
              books: bookPromise
            }}
            )
        }))  
        .then((x) => Promise.all(x))
        .then(object => res.end(subjectList({ object, paging, search:((queryStringAsObject(req).search) ? queryStringAsObject(req).search : 'invERRORalid') })))
      })
    }
    else{
      //same as author
      buildPaging(subjectColl, req).then(paging => {
        subjectColl.find({}).skip(paging.skip).limit(paging.limit).toArray()
        .then(subjects => subjects.map(x => {
          return bookColl.find({subject: {$eq: x._id}}).limit(5).toArray()
            .then(bookPromise => {return{
              subject: x,
              books: bookPromise
            }}
            )
        }))  
        .then((x) => Promise.all(x))
        .then(object => res.end(subjectList({ object, paging })))
      })
    }
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

    let searchGoal = queryStringAsObject(req).search || ''

    Promise.all([
      shelfColl.find({name: {$regex: new RegExp(searchGoal)}}).limit(10).toArray(),
      authorColl.find({name: {$regex: new RegExp(searchGoal)}}).limit(10).toArray(),
      bookColl.find({title: {$regex: new RegExp(searchGoal)}}).limit(10).toArray()
    ]).then((items) =>{
      let firstResult = items[0].map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('')
      res.write(`<br><br><a href="/books?search=${searchGoal}">Ver Mais<a><br><br>`)
      res.write(`<br><br><a href="/shelves?search=${searchGoal}">Ver Mais<a><br><br>`)
      res.write(`<br><br><a href="/authors?search=${searchGoal}">Ver Mais<a><br><br>`)
      res.write(`<br><br><a href="/languages?search=${searchGoal}">Ver Mais<a><br><br>`)
      res.write(`<br><br><a href="/subjects?search=${searchGoal}">Ver Mais<a><br><br>`)
      let secondResult = items[1].map(x => `<a href="/author/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('')
      let thirdResult = items[2].map(x => `<a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a><br>`).join('')
      let Result = firstResult + secondResult + thirdResult
      return Result
    })
    .then(content => res.end(wrapper({ content })))

  })

  // make our http server listen to connections
  server.listen(8080)

})