var http         = require('http')
var Router       = require('router')
var finalhandler = require('finalhandler')


const mongo = require('mongodb');
// Connection url
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'pickoob';

let buildMenu = () => '<p>Menu</p>'



//DB connection
mongo.MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {



// this example is about the mergeParams option

// make a router with out special options
var router = Router()
var server = http.createServer(function onRequest(req, res) {

  // set something to be passed into the router
  req.params = { type: 'testando...' }

  router(req, res, finalhandler(req, res))
})

router.get('/', (req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  /*
  let books = [
    { id: 1, name: 'alice-in-wonderland' },
    { id: 2, name: 'sherlock-holmes' },
    { id: 3, name: 'twelve-years-slayer' }
  ]

  books.forEach(b => res.write(`<a href="/book/${b.name}/${b.id}">${b.name}</a>\n`))

  // with respond with the the params that were passed in
  res.end('home\n')
  */

  res.write(buildMenu())
  
    // insert book
    client.db(dbName).collection("book").find({}).toArray((err, items) => {
        items.forEach(b => res.write(`<a href="/book/${b.title}/${b._id}">${b.title}</a><br>`))
        res.end()
    })
    


})


router.get('/book', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    //req.params = {type: ''}
    // with respond with the the params that were passed in

    client.db(dbName).collection("book").find({}).toArray((err, items) => {
        items.forEach(b => {
          let finalTitle = b.title.toLowerCase()
          finalTitle = finalTitle.replace(/\s/g, "-")
          res.write(`<a href="/book/${finalTitle}/${b._id}">${b.title}</a><br>`)})
        res.end('lista de livros')
    })

    
  })

router.get('/shelf', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    //req.params = {type: 'lista de categorias'}

    client.db(dbName).collection("shelf").find({}).toArray((err, items) => {
        items.forEach(b => {

          let finalName = b.name.toLowerCase()
          finalName = finalName.replace(/\s/g, "-")
          res.write(`<a href="/book/${finalName}/${b._id}">${b.name}</a><br>`)})
        res.end('lista de categorias')
    })
  })

router.get('/author', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    //req.params = {type: 'lista de autores'}
    client.db(dbName).collection("author").find({}).toArray((err, items) => {

        items.forEach(b => {
          
          let finalName = b.name.toLowerCase()
          finalName = finalName.replace(/\s/g, "-")
          res.write(`<a href="/book/${finalName}/${b._id}">${b.name}</a><br>`)})
        res.end('lista de autores')
    })
  })



  router.get('/book/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.write(buildMenu())
    //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
    //req.params = {type: 'lista de autores'}

    client.db(dbName).collection("book").findOne({_id: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
      //let finalTitle = b.title.toLowerCase()
      res.write(`<a href="/book/${b.title}/${b._id}">${b.title}</a><br>${b.rights}`)
        res.end('lista de livros\n')
    })



    //res.end('lista de autores\n')
  })

    router.get('/shelf/:title/:id', function (req, res) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.write(buildMenu())
    //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
    //req.params = {type: 'lista de autores'}

        client.db(dbName).collection("shelf").findOne({_id: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
            res.write(`<a href="/shelf/${b.title}/${b._id}">${b.title}</a><br>`)
            res.end('lista de livros\n')
        })
    })


    router.get('/author/:name/:id', function (req, res) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.write(buildMenu())
        //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
        //req.params = {type: 'lista de autores'}
    
        client.db(dbName).collection("book").findOne({_id: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
            res.write(`<a href="/book/${b.name}/${b._id}">${b.name}</a><br>`)
            res.end('lista de livros\n')
        })
    })


// make another router with our options
var handler = Router()

// mount our new router to a route that accepts a param
router.use('/:path', handler)

handler.get('/', function (req, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')

  // will respond with the param of the router's parent route
  res.end(path + '\n')
})

// make our http server listen to connections
server.listen(8080)

})