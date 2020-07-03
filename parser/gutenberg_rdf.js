const fs = require('fs')
const { promisify } = require('util')
const { gunzip } = require('zlib')

const mongo = require('mongodb')
const R = require('ramda')
const RdfXmlParser = require('rdfxml-streaming-parser').RdfXmlParser

const readFilesRecursively = require('../lib/files/read-files-recursively')
const sanitize = require('../lib/string/sanitize')


// global values
const aws = require('aws-sdk')
const s3 = new aws.S3({
  endpoint: new aws.Endpoint('ams3.digitaloceanspaces.com')
})


// global functions
// promisify gunzip
const gunzipPromise = promisify(gunzip)

// returns the last element of an array
const last = (a) => a[a.length - 1]

// find the row, if already exists returns the ObjectId, otherwise insert it and return the ObjectId
// JS Promise flats another returned Promise automatically
const insertNoDuplicated = (col, search, data) => col.findOne(search)
  .then(r => r ? r._id : col.insertOne(data).then(r => r.insertedId))
  .then(id => new mongo.ObjectID(id))

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

const getSynopsis = (text) => text.split(/(\n|\r\n){2,}/)
  // remove blank lines
  .filter(x => !x.match(/^\s+$/g))
  // remove lines that start with spaces
  .filter(x => !x.match(/^\s+/g))
  // remove small lines
  .filter(x => x.match(/.{50,}(\n|\r\n)/))
  // discard invalid chars
  .filter(x => !x.match(/[\@\$\%\|\-\+\_\*\=\(\)\[\]]/) && !x.match(/http(s){0,1}\:\/\//) && !x.match(/gutenberg/i))
  .reduce((a, x) => (a.length < 500) ? a.concat(`${x}\n\n`) : a, '')
  .substr(0, 800)


if(!process.argv[2]) throw new Error('You must pass the dir path as parameter')


const parseRDF = (rdf, next) => {

  // not a RDF file
  if(! (/\.rdf$/i).test(rdf)) {
    next()
    return
  }

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


  fs.createReadStream(rdf)
    .pipe(new RdfXmlParser())
    .on('data', gather)
    .on('error', console.error)
    .on('end', () => {

      // gutenberg book id
      let curDir = rdf.split(/\//).slice(0, -1).join('/')
      let gbBookId = book.source.id
      let epub = `${curDir}/pg${gbBookId}-images.epub`

      // check if book epub is available
      fs.promises.access(epub, fs.constants.R_OK).then(() => {

        // MongoDB
        // connection
        return mongo.MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }).then(client => {

          let db = client.db('pickoob')

          let authorOIdsPromises = entityToOIdsPromises(db.collection('author'),
            person['author'].filter(x => x.name || x.alias.length).map(x => {
              if(!x.name) x.name = x.alias[0]
              x.active = true
              x.inserted_at = x.updated_at = new Date()
              return x
            })
          )
          let contributorOIdsPromises = entityToOIdsPromises(db.collection('author'),
            person['contributor'].filter(x => x.name || x.alias.length).map(x => {
              if(!x.name) x.name = x.alias[0]
              x.active = true
              x.inserted_at = x.updated_at = new Date()
              return x
            })
          )
          let illustratorOIdsPromises = entityToOIdsPromises(db.collection('author'),
            person['illustrator'].filter(x => x.name || x.alias.length).map(x => {
              if(!x.name) x.name = x.alias[0]
              x.active = true
              x.inserted_at = x.updated_at = new Date()
              return x
            })
          )
          let shelfOIdsPromises = entityToOIdsPromises(db.collection('shelf'), 
            shelf.map(x => {
              x.active = true
              x.inserted_at = x.updated_at = new Date()
              return x
            })
          )
          let subjectOIdsPromises = entityToOIdsPromises(db.collection('subject'), 
            subject.map(x => {
              x.active = true
              x.inserted_at = x.updated_at = new Date()
              return x
            })
          )

          language.active = true
          language.inserted_at = language.updated_at = new Date()

          return Promise.all([
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
            book.active = false // if upload the epub file with success it will be marked as true
            book.inserted_at = book.updated_at = new Date()

            let bookTxt = `${curDir}/pg${gbBookId}.txt.utf8`
            let bookTxtGzip = `${curDir}/pg${gbBookId}.txt.utf8.gzip`
            let cover = `${curDir}/pg${gbBookId}.cover.medium.jpg`

            // get synopsis
            let synopsis = fs.promises.readFile(bookTxt, { encoding: 'utf-8' })
              .then(data => book.synopsis = getSynopsis(data))
              .catch(() => fs.promises.readFile(bookTxtGzip)
                .then( buffer => gunzipPromise(buffer).then(x => book.synopsis = getSynopsis(x.toString('utf8'))) )
              ).catch(() => console.error(`No synopsis files found: ${bookTxt} nor ${bookTxtGzip}`))

            return synopsis.then(() =>
              // so, insert the book
              insertNoDuplicated(db.collection('book'), { unique: book.unique }, book).then(bid => {

                // upload book and book cover to CDN
                return fs.promises.readFile(epub).then(data => {
                  return s3.upload({
                    Bucket: 'pickoob',
                    Body: data,
                    Key: `content/books/${bid}/book.epub`,
                    ACL: 'public-read'
                  }).promise()
                }).then(() => 
                  fs.promises.readFile(cover).then(data => {
                    return s3.upload({
                      Bucket: 'pickoob',
                      Body: data,
                      Key: `content/books/${bid}/cover.jpg`,
                      ACL: 'public-read'
                    }).promise()
                  })
                  // no problem if cover is not uploaded
                  .catch(() => console.log(`book cover ${cover} not uploaded`))
                ).then(() => db.collection('book').updateOne({ _id: bid }, { $set: { active: true } }))

              })
            )

          }).then(() => client.close())

        })
    
      })
      .catch(() => console.error(`Epub file not found: ${epub}`))
      .then(() => {
        console.log(`Done processing the file ${rdf}`)
        next()
      })

    })

}

readFilesRecursively(process.argv[2], parseRDF)