const fs = require('fs')

const RdfXmlParser = require('rdfxml-streaming-parser').RdfXmlParser
const mongo = require('mongodb')

const readFilesRecursively = require('./lib/read-files-recursively')
const sanitize = require('../lib/string/sanitize')


// returns the last element of an array
const last = (a) => a[a.length - 1]

// find the row, if already exists returns the ObjectId, otherwise insert it and return the ObjectId
// JS Promise flats another returned Promise automatically
const insertNoDuplicated = (col, search, data) => col.findOne(search).then(r => r ? r._id : col.insertOne(data).then(r => r.insertedId)).then(id => new mongo.ObjectID(id))


if(!process.argv[2]) throw new Error('You must pass the dir path as parameter')


const parseRDF = (rdf, next) => {

  // not a RDF file
  if(! (/\.rdf$/i).test(rdf)) return

  let book = {
      source: {
        type: 'gutenberg'
      }
    },
    author = [{}],
    contributor = [],
    illustrator = [],
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
    else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/title') book.title = o.object.value.replace(/(\r|\n){1,}/g, ' ')
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


  const rdfParser = new RdfXmlParser()

  //rdfParser.import(textStream)
  fs.createReadStream(rdf)
    .pipe(rdfParser)
    .on('data', gather)
    .on('error', console.error)
    .on('end', () => {

      // MongoDB
      // connection url
      const url = 'mongodb://localhost:27017';
      // catabase Name
      const dbName = 'pickoob';

      // connection
      mongo.MongoClient.connect(url, { useUnifiedTopology: true }).then(client => {

        let authorOIdsPromises = author
          // ensure the item is valid
          .filter(x => x.name || x.alias)
          // ensure name and alias are fullfiled
          .map(x => {
            if(!x.name) x.name = x.alias
            else if(!x.alias) x.alias = x.name
            return x
          })
          // add unique field
          .map(x => {
            x.unique = sanitize(x.name)
            return x
          })
          // convert to an array of Promises of ObjectIds
          .map(x => insertNoDuplicated(client.db(dbName).collection('author'), { unique: x.unique }, x))

        let shelfOIdsPromises = shelf
          // ensure the item is valid
          .filter(x => !!x.name)
          // add unique field
          .map(x => {
            x.unique = sanitize(x.name)
            return x
          })
          // convert to an array of Promises of ObjectIds
          .map(x => insertNoDuplicated(client.db(dbName).collection('shelf'), { unique: x.unique }, x))

        Promise.all(authorOIdsPromises).then(authorOIds => {
          Promise.all(shelfOIdsPromises).then(shelfOIds => {

            book.unique = sanitize(`${book.title}-${book.issued}`)

            book.author = authorOIds
            book.shelf = shelfOIds

            insertNoDuplicated(client.db(dbName).collection('book'), { unique: book.unique }, book).then(() => {
              console.log(`Done processing the file ${rdf}`)
              client.close()
              next()
            })

          })
        })

      })
    
    })

}

readFilesRecursively(process.argv[2], parseRDF)