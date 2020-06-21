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
let changePage = (numBotoes) => {`<a href="/${++pageNumber}">Proxima</a>`}

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
    }))
  })
      
  //}).then((data) => console.log(data))
  //console.log(collectionsName[0])
  //collectionsName.forEach( b => console.log(b + "aaaaaaaaaaaaaaaaaaaaa"))
  //=============== Pegar nome das collections
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




  //================================== Pagination Test ==================================

    // let skips = 5;

    // let cursor = client.db(dbName).collection()
    // let testandoa = client.db(dbName).listCollections();
    // console.log(testando)



  //================================== Pagination Test ==================================
  
    // insert book
    //res.write(`<h1>Categories</h1><br>`)
    /*
    client.db(dbName).collection("shelf").find({}).skip(0).limit(10).toArray((err, items) => {
        items.forEach(b => res.write(`<a href="/shelf/${b.name}/${b._id}">${b.name}</a><br>`))
        res.end()
    })
    */
    
    // .then(() => {
    //   return client.db(dbName).collection("author").find({}).skip(0).limit(10).toArray((err, items) => {
    //     items.forEach(b => res.write(`<a href="/author/${b.name}/${b._id}">${b.name}</a><br>`))
    //     res.end()
    // })
    // })
    /*
    .then(() => {
      return client.db(dbName).collection("book").find({}).skip(0).limit(10).toArray((err, items) => {
        items.forEach(b => res.write(`<a href="/book/${b.title}/${b._id}">${b.title}</a><br>`))
        res.write(changePage(pageNumber))
        res.end()
  })

    })*/
    //res.write(`<h1>Authors</h1><br>`) esta sendo impresso antes do resultado das consultas...
    
    //res.write(`<h1>Books</h1><br>`)

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

/*
router.get('/:pageNumber', function(req, res) {
  res.statusCode = 200
  res.setHeader('Content-type', 'text/html; charset = utf-8')
  res.write(searchField())
  console.log(parseInt(req.params.pageNumber) + 1)
  client.db(dbName).collection("book").find({}).skip(((parseInt(req.params.pageNumber) - 1)*10)).limit(10).toArray((err, items) => {
    console.log("bbbbbbbbbbbbbbbbbbb")
    items.forEach(b => {
      let finalTitle = b.title.toLowerCase()
      finalTitle = finalTitle.replace(/\s/g, "-")
      res.write(`<a href="/book/${finalTitle}/${b._id}">${b.title}</a><br>`)
    })
    res.write(changePage(req.params.pageNumber)) //criar botão
    res.end('lista de livros')
  })
   
})
*/



router.get('/books', function (req, res) {
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

router.get('/shelves', function (req, res) {
  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  /*
  res.write(searchField())
  */
  client.db(dbName).collection("shelf").find({}).toArray()
    .then(items => items.map(s => `<a href="/shelf/${s.name}/${s._id}">${s.name}</a><br>`).join(''))
    .then(content => {
      res.write(wrapper({ content }))
      res.end()
    })

})

router.get('/authors', function (req, res) {
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