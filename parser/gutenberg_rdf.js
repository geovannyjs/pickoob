const fs = require('fs')

const R = require('ramda')

const RdfXmlParser = require('rdfxml-streaming-parser').RdfXmlParser
const mongo = require('mongodb')

const readFilesRecursively = require('../lib/files/read-files-recursively')
const sanitize = require('../lib/string/sanitize')


// returns the last element of an array
const last = (a) => a[a.length - 1]

// find the row, if already exists returns the ObjectId, otherwise insert it and return the ObjectId
// JS Promise flats another returned Promise automatically
const insertNoDuplicated = (col, search, data) => col.findOne(search).then(r => r ? r._id : col.insertOne(data).then(r => r.insertedId)).then(id => new mongo.ObjectID(id))

const entityToOIdsPromises = (col, data) => data
  // ensure the item has a name property
  .filter(x => !!x.name)
  // add unique field
  .map(x => {
    x.unique = sanitize(x.name)
    return x
  })
  // remove duplicateds
  .reduce((a, x) => {
    if(!R.any(y => y.unique === x.unique)(a)) a.push(x)
    return a
  }, [])
  // convert to an array of Promises of ObjectIds
  .map(x => insertNoDuplicated(col, { unique: x.unique }, x))


if(!process.argv[2]) throw new Error('You must pass the dir path as parameter')


const parseRDF = (rdf, next) => {

  // not a RDF file
  if(! (/\.rdf$/i).test(rdf)) return

  let book = {
      source: {
        type: 'gutenberg'
      }
    },
    language = {
      code: '',
      name: ''
    },
    person = {
      author: [],
      contributor: [],
      illustrator: []
    },
    personCapture = null,
    shelf = [],
    shelfCapture = false,
    subject = [],
    subjectCapture = false


  const gather = (o) => {

    //book id
    if(!book.source.id) {
      // regex to capture the id from the subject value 
      let re = /http\:\/\/www\.gutenberg\.org\/ebooks\/(\d+)/
      // test the regex, if true capture the id
      re.test(o.subject.value) && (book.source.id = parseInt(re.exec(o.subject.value)[1]))
    }

    // captures
    // person capture mode
    if(personCapture) {
      //birthdate
      if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/birthdate')
        last(person[personCapture]).birthdate = o.object.value
      //alias
      else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/alias')
        last(person[personCapture]).alias.push(o.object.value)
      //deathdate
      else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/deathdate')
        last(person[personCapture]).deathdate = o.object.value
      //name
      else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/name')
        last(person[personCapture]).name = o.object.value
      //webpage
      else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/webpage')
        null
      else
        personCapture = null
    }
    // we are in shelf capture mode
    else if(shelfCapture) {
      // after the o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/bookshelf'
      // we can have two types of tuples, so we discard that one that is not interesting to us
      if(o.predicate.value != 'http://purl.org/dc/dcam/memberOf') {
        shelf.push({ name: o.object.value })
        shelfCapture = false
      }
    }
    // we are in subject capture mode
    else if(subjectCapture) {
      if(o.predicate.value != 'http://purl.org/dc/dcam/memberOf') {
        // LoC class is just 2 chars, so we ignore it
        if(o.object.value.length > 2) subject.push({ name: o.object.value })
        subjectCapture = false
      }
    }


    // book title
    if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/title') book.title = o.object.value.replace(/(\r|\n){1,}/g, ' ')
    // issue date
    else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/issued') book.issued = o.object.value
    //language
    else if((o.predicate && o.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value') && (o.object.datatype.value === 'http://purl.org/dc/terms/RFC4646')) language.code = o.object.value.toLowerCase()

    // person
    // author
    else if(o.predicate.value === 'http://purl.org/dc/terms/creator') {
      personCapture = 'author'
      person.author.push({ alias: [] })
    }
    // contributor
    else if(o.predicate.value === 'http://id.loc.gov/vocabulary/relators/ctb') {
      personCapture = 'contributor'
      person.contributor.push({ alias: [] })
    }
    // illustrator
    else if(o.predicate.value === 'http://id.loc.gov/vocabulary/relators/ill') {
      personCapture = 'illustrator'
      person.illustrator.push({ alias: [] })
    }

    // shelf - init the capture
    else if(o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/bookshelf') shelfCapture = true

    // subject - init the capture
    else if(o.predicate.value === 'http://purl.org/dc/terms/subject') subjectCapture = true

    //rights
    else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/rights') book.rights = o.object.value

  }


  const rdfParser = new RdfXmlParser()

  //rdfParser.import(textStream)
  fs.createReadStream(rdf)
    .pipe(rdfParser)
    .on('data', gather)
    .on('error', console.error)
    .on('end', () => {

      // MongoDB
      // connection
      mongo.MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }).then(client => {

        let db = client.db('pickoob')

        let authorOIdsPromises = entityToOIdsPromises(db.collection('author'),
          person['author'].filter(x => x.name || x.alias.length).map(x => {
            if(!x.name) x.name = x.alias[0]
            return x
          })
        )
        let contributorOIdsPromises = entityToOIdsPromises(db.collection('author'),
          person['contributor'].filter(x => x.name || x.alias.length).map(x => {
            if(!x.name) x.name = x.alias[0]
            return x
          })
        )
        let illustratorOIdsPromises = entityToOIdsPromises(db.collection('author'),
          person['illustrator'].filter(x => x.name || x.alias.length).map(x => {
            if(!x.name) x.name = x.alias[0]
            return x
          })
        )
        let shelfOIdsPromises = entityToOIdsPromises(db.collection('shelf'), shelf)
        let subjectOIdsPromises = entityToOIdsPromises(db.collection('subject'), subject)


        Promise.all([
          Promise.all(authorOIdsPromises),
          Promise.all(contributorOIdsPromises),
          Promise.all(illustratorOIdsPromises),
          Promise.all(shelfOIdsPromises),
          Promise.all(subjectOIdsPromises),
          insertNoDuplicated(db.collection('language'), { code: language.code }, language)
        ]).then(res => {

          let authorOIds, contributorOIds, illustratorOIds, shelfOIds, subjectOIds, languageOId

          [authorOIds, contributorOIds, illustratorOIds, shelfOIds, subjectOIds, languageOId] = res

          book.unique = sanitize(`${book.title}-${language.code}-${book.issued}`)

          book.author = authorOIds
          book.contributor = contributorOIds
          book.illustrator = illustratorOIds
          book.language = languageOId
          book.shelf = shelfOIds
          book.subject = subjectOIds

          insertNoDuplicated(db.collection('book'), { unique: book.unique }, book).then(() => {
            console.log(`Done processing the file ${rdf}`)
            client.close()
            next()
          })

        })

      })
    
    })

}

readFilesRecursively(process.argv[2], parseRDF)