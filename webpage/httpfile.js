const fs = require('fs')
var http         = require('http')
var Router       = require('router')
var finalhandler = require('finalhandler')
const querystring = require('querystring')

// templates
const wrapper = require('./templates/components/wrapper')


const mongo = require('mongodb');
// Connection url
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'pickoob';
var pageNumber = 1
let searchField = () => '<form method="get"><input type="text" id="search" name="search"> <input formaction="/search" type="submit" id="searchSub" value="Search"></form> <br>'
let changePage = (currentPage) => `<a href="/page/${++currentPage}">Proxima</a>`

//pesquisa.indexOF()

//DB connection
mongo.MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {
  


// this example is about the mergeParams option

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
      if (err) {
        res.writeHead(404)
        res.end(JSON.stringify(err))
        return
      }
      res.writeHead(200)
      res.end(data)
    })

  })
}

router.get('/', (req, res) => {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  //=============== Pegar nome das collections
  var collectionsName = []
  var contagem = 0
  pageNumber = 1 //ao voltar para a tela inicial deve-se a contagem da pagina deve voltar a 1
  client.db(dbName).listCollections().toArray().then(data => {
    data.forEach(b => client.db(dbName).collection(b.name).count().then(quantity => { 
    
      contagem = contagem + quantity
      console.log(contagem)
      return contagem
    }))
  })

  res.write(searchField())
      

    client.db(dbName).collection("shelf").find({}).skip(0).limit(10).toArray()
    .then(items => items.forEach(b => res.write(`<a href="/shelf/${b.name}/${b._id}">${b.name}</a><br>`)))
    .then(() =>  client.db(dbName).collection("author").find({}).skip(0).limit(10).toArray())
    .then(items => items.forEach(b => res.write(`<a href="/author/${b.name}/${b._id}">${b.name}</a><br>`)))
    .then(() =>  client.db(dbName).collection("book").find({}).skip(0).limit(10).toArray())
    .then(items => items.forEach(b => res.write(`<a href="/book/${b.title}/${b._id}">${b.title}</a><br>`)))
    .then(() => {
      res.write(changePage(pageNumber))
      res.end()
    })

})

router.get('/page/:pageNumber', function(req, res) {
  res.statusCode = 200
  res.setHeader('Content-type', 'text/html; charset = utf-8')
  res.write(searchField())
  console.log(parseInt(req.params.pageNumber) + 1)
  client.db(dbName).collection("shelf").find({}).skip(((parseInt(req.params.pageNumber) - 1)*10)).limit(10).toArray()
  .then(items => {
    items.forEach(b => {
    b.name = b.name.toLowerCase()
    res.write(`<a href="/shelf/${b.name.replace(/\s/g,"-")}/${b._id}">${b.name}</a><br>`)
  })
    }
  ).then(() => client.db(dbName).collection("author").find({}).skip(((parseInt(req.params.pageNumber) - 1)*10)).limit(10).toArray())
   .then(items => {
    items.forEach(b => {
    b.name = b.name.toLowerCase()
    res.write(`<a href="/author/${b.name.replace(/\s/g,"-")}/${b._id}">${b.name}</a><br>`)
  })
    })
   .then(() => client.db(dbName).collection("book").find({}).skip(((parseInt(req.params.pageNumber) - 1)*10)).limit(10).toArray())
   .then(items => {
    items.forEach(b => {
    b.title = b.title.toLowerCase()
    res.write(`<a href="/book/${b.title.replace(/\s/g,"-")}/${b._id}">${b.title}</a><br>`)
  })
    })
   .then(() => res.write(changePage(req.params.pageNumber)))
   .then(() => res.end())
   
})


  router.get('/books', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    client.db(dbName).collection('book').find({}).toArray()
      .then(items => items.map(x => `<a href="/book/${x.title}/${x._id}">${x.title}</a><br>`).join(''))
      .then(content => {
        res.write(wrapper({ content }))
        res.end()
      })
  })

  router.get('/shelves', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    client.db(dbName).collection('shelf').find({}).toArray()
      .then(items => items.map(x => `<a href="/shelf/${x.name}/${x._id}">${x.name}</a><br>`).join(''))
      .then(content => {
        res.write(wrapper({ content }))
        res.end()
      })
  })

  router.get('/authors', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    client.db(dbName).collection('author').find({}).toArray()
      .then(items => items.map(x => `<a href="/author/${x.name}/${x._id}">${x.name}</a><br>`).join(''))
      .then(content => {
        res.write(wrapper({ content }))
        res.end()
      })
  })

  router.get('/book/:title/:id', function (req, res) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.write(searchField())
    client.db(dbName).collection("book").findOne({_id: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
      res.write(`<a href="/book/${b.title}/${b._id}">${b.title}</a><br>${b.rights}`)
        res.end('lista de livros\n')
    })
  })

    router.get('/shelf/:title/:id', function (req, res) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.write(searchField())
        client.db(dbName).collection("book").findOne({shelf: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
            res.write(`<a href="/shelf/${b.title}/${b._id}">${b.title}</a><br>`)
            res.end('lista de livros\n')
        })
    })


    router.get('/author/:name/:id', function (req, res) {
        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.write(searchField())
        client.db(dbName).collection("book").findOne({author: new mongo.ObjectID(req.params.id)}, {}, (err, b) => {
            res.write(`<a href="/author/${b.title}/${b._id}">${b.title}</a><br>`)
            res.end('lista de livros\n')
        })
    })


    router.get('/search', function (req, res) {
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      console.log(Object.values(querystring.parse(req.originalUrl)))
      let searchGoal = Object.values(querystring.parse(req.originalUrl))
      res.write(searchField())


      client.db(dbName).collection("book").find({title: {$regex: new RegExp(searchGoal)}}).toArray()
      .then(items => items.forEach(b => {
        b.title = b.title.toLowerCase()
        res.write(`<a href="/book/${b.title.replace(/\s/g,"-")}/${b._id}">${b.title}</a><br>`)})
      )

    client.db(dbName).collection("author").find({name: {$regex: new RegExp(searchGoal)}}).toArray()
    .then(items => items.forEach(b => {
      b.name = b.name.toLowerCase()
      res.write(`<a href="/author/${b.name.replace(/\s/g,"-")}/${b._id}">${b.name}</a><br>`)})
    )

  client.db(dbName).collection("shelf").find({name: {$regex: new RegExp(searchGoal)}}).toArray()
    .then(items => items.forEach(b => {
      b.name = b.name.toLowerCase()
      res.write(`<a href="/shelf/${b.name.replace(/\s/g,"-")}/${b._id}">${b.name}</a><br>`)})
    )



  })



// make our http server listen to connections
server.listen(8080)

})