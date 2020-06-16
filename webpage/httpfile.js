var http         = require('http')
var Router       = require('router')
var finalhandler = require('finalhandler')
const querystring = require('querystring');


const mongo = require('mongodb');
// Connection url
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'pickoob';

let searchField = () => '<form method="get"><input type="text" id="search" name="search"> <input formaction="/search" type="submit" id="searchSub" value="Search"></form> <br>'

//pesquisa.indexOF()

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

  res.write(searchField())
  
    // insert book
    //res.write(`<h1>Categories</h1><br>`)
    client.db(dbName).collection("shelf").find({}).toArray((err, items) => {
        items.forEach(b => res.write(`<a href="/shelf/${b.name}/${b._id}">${b.name}</a><br>`))
        //res.end()
    })
    //res.write(`<h1>Authors</h1><br>`) esta sendo impresso antes do resultado das consultas...
    client.db(dbName).collection("author").find({}).toArray((err, items) => {
      items.forEach(b => res.write(`<a href="/author/${b.name}/${b._id}">${b.name}</a><br>`))
      //res.end()
  })
    //res.write(`<h1>Books</h1><br>`)
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
    res.write(searchField())
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

    res.write(searchField())
    client.db(dbName).collection("shelf").find({}).toArray((err, items) => {
        items.forEach(b => {

          let finalName = b.name.toLowerCase()
          finalName = finalName.replace(/\s/g, "-")
          res.write(`<a href="/shelf/${finalName}/${b._id}">${b.name}</a><br>`)})
        res.end('lista de categorias')
    })
  })

router.get('/author', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    //req.params = {type: 'lista de autores'}

    res.write(searchField())
    client.db(dbName).collection("author").find({}).toArray((err, items) => {

        items.forEach(b => {

            let finalName = b.name.toLowerCase()
            finalName = finalName.replace(/\s/g, "-")
          res.write(`<a href="/author/${finalName}/${b._id}">${b.name}</a><br>`)})
        res.end('lista de autores')
    })
  })



  router.get('/book/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    //res.write(buildMenu())
    //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
    //req.params = {type: 'lista de autores'}
    res.write(searchField())
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
        //res.write(buildMenu())
    //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
    //req.params = {type: 'lista de autores'}
    res.write(searchField())
        client.db(dbName).collection("book").findOne({shelf: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
            res.write(`<a href="/shelf/${b.title}/${b._id}">${b.title}</a><br>`)
            res.end('lista de livros\n')
        })
    })


    router.get('/author/:name/:id', function (req, res) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        //res.write(buildMenu())
        //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
        //req.params = {type: 'lista de autores'}
        res.write(searchField())
        client.db(dbName).collection("book").findOne({author: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
            res.write(`<a href="/author/${b.title}/${b._id}">${b.title}</a><br>`)
            res.end('lista de livros\n')
        })
    })


    router.get('/search', function (req, res) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      //res.write(buildMenu())
  //res.write(`Você acessou o livro de titulo ${req.params.title} e de id ${req.params.id}\n`)
  //req.params = {type: 'lista de autores'}
      //console.log(url)
      
      
      //var urls = new URL(window.location.href)
      //console.log(urls)
      console.log(Object.values(querystring.parse(req.originalUrl)))
      //console.log("O VALOR DO REQUEST É: " + urls.searchParams.get("search"))
      let searchGoal = Object.values(querystring.parse(req.originalUrl))
      res.write(searchField())
      //var query = {title : /^searchGoal/}
      // client.db(dbName).collection("book").findOne({title: {$regex: new RegExp('^' + searchGoal)}}, {}, (err, b) => {  
      //   res.write(`<a href="/book/${b.title}/${b._id}">${b.title}</a><br>`)
      //     res.end('lista de livros\n')
      // })


      client.db(dbName).collection("book").find({title: {$regex: new RegExp(searchGoal)}}).toArray((err, items) => {
        items.forEach(b => {
          let finalTitle = b.title.toLowerCase()
          finalTitle = finalTitle.replace(/\s/g, "-")
          res.write(`<a href="/book/${finalTitle}/${b._id}">${b.title}</a><br>`)
          //res.end('lista de livros')
        })
        
    })

    client.db(dbName).collection("author").find({name: {$regex: new RegExp(searchGoal)}}).toArray((err, items) => {
      items.forEach(b => {
        let finalTitle = b.name.toLowerCase()
        finalTitle = finalTitle.replace(/\s/g, "-")
        res.write(`<a href="/author/${finalTitle}/${b._id}">${b.name}</a><br>`)
        //res.end('lista de livros')
      })
      
  })

  client.db(dbName).collection("shelf").find({name: {$regex: new RegExp(searchGoal)}}).toArray((err, items) => {
    items.forEach(b => {
      let finalTitle = b.name.toLowerCase()
      finalTitle = finalTitle.replace(/\s/g, "-")
      res.write(`<a href="/shelf/${finalTitle}/${b._id}">${b.name}</a><br>`)
      res.end('lista de livros')
    })

})



  })



// make our http server listen to connections
server.listen(8080)

})