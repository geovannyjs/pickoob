const fs = require('fs')

const RdfXmlParser = require("rdfxml-streaming-parser").RdfXmlParser
const MongoClient = require('mongodb').MongoClient;


// returns the last element of an array
const last = (a) => a[a.length - 1]


// Connection url
const url = 'mongodb://localhost:27017';


// Database Name
const dbName = 'pickoob';



if(!process.argv[2]) throw new Error('You must pass the RDF file as parameter')

const myParser = new RdfXmlParser()
const myTextStream = fs.createReadStream(process.argv[2])


let book = {
    source: {
      type: "gutenberg"
    }
  }
  author = [{}],
  shelf = [],
  shelfCapture = false


const gather = (o) => {

  //book id
  if(!book.source.id) {
    // regex to capture the id from the subject value 
    let re = /http\:\/\/www\.gutenberg\.org\/ebooks\/(\d+)/
    // test the regex, if true capture the id
    re.test(o.subject.value) && (book.source.id = parseInt(re.exec(o.subject.value)[1]))
  }

  // we are in shelf capture mode
  if(shelfCapture) {
    // after the o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/bookshelf'
    // we can have two types of tuples, so we discard that one that is not interesting to us
    if(o.predicate.value != 'http://purl.org/dc/dcam/memberOf') {
      shelf.push({ name: o.object.value })
      shelfCapture = false
    }
  }

  // book title
  else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/title') book.title = o.object.value
  // issue date
  else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/issued') book.issued = o.object.value
  //language
  else if((o.predicate && o.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value') && (o.object.datatype.value === 'http://purl.org/dc/terms/RFC4646')) book.language = o.object.value

  // bookshelf - init the capture
  else if(o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/bookshelf') shelfCapture = true

  //rights
  else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/rights') book.rights = o.object.value

  //creator
  //birthdate
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/birthdate') {
    if(last(author).birthdate) author.push({}) 
    last(author).birthdate = o.object.value
  }
  //alias
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/alias') {
    if(last(author).alias) author.push({})
    last(author).alias = o.object.value
  }
  //deathdate
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/deathdate') {
    if(last(author).deathdate) author.push({})
    last(author).deathdate = o.object.value
  }
  //name
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/name') {
    if(last(author).name) author.push({})
    last(author).name = o.object.value
  }

}


// debug structure
const fn = (o) => console.log(JSON.stringify(o))

myParser.import(myTextStream)
  .on('data', gather)
  .on('error', console.error)
  .on('end', () => {
    console.log(author)
    console.log(shelf)
    console.log(book)
    console.log('Done')
  })

// Connect using MongoClient

MongoClient.connect(url, { useUnifiedTopology: true }, (err, client) => {

  // insert authors
  author.forEach(a => { client.db(dbName).collection("author").insertOne(a) })

  // insert shelves
  shelf.forEach(s => { client.db(dbName).collection("shelf").insertOne(s) })

  // insert book
  client.db(dbName).collection("book").insertOne(book)
  
  //client.close()
  
})