const fs = require('fs')
const RdfXmlParser = require("rdfxml-streaming-parser").RdfXmlParser

if(!process.argv[2]) throw new Error('You must pass the RDF file as parameter')

const myParser = new RdfXmlParser()
const myTextStream = fs.createReadStream(process.argv[2])


let book = {
  source: {
    type: "gutenberg"
  },
  shelf: []

}
let author = {}


const gather = (o) => {
  //book id
  if(!book.source.id) {
    // regex to capture the id from the subject value 
    let re = /http\:\/\/www\.gutenberg\.org\/ebooks\/(\d+)/
    // test the regex, if true capture the id
    re.test(o.subject.value) && (book.source.id = parseInt(re.exec(o.subject.value)[1]))
  }

  // book title
  if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/title') book.title = o.object.value
  // issue date
  else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/issued') book.issued = o.object.value
  //language
  else if((o.predicate && o.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value') && (o.object.datatype.value === 'http://purl.org/dc/terms/RFC4646')) book.language = o.object.value
  //bookshelf
  else if(/*(o.subject.value === 'N4513ec73c10d49a2b2fbaa05bd91f621') &&*/ (o.predicate && o.predicate.value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#value') && (o.object.datatype.value === 'http://www.w3.org/2001/XMLSchema#string')) book.shelf.push(o.object.value)
  //rights
  else if(o.predicate && o.predicate.value === 'http://purl.org/dc/terms/rights') book.rights = o.object.value
  //creator
    //birthdate
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/birthdate') author.birthdate = o.object.value
    //alias
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/alias') author.alias = o.object.value
    //deathdate
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/deathdate') author.deathdate = o.object.value
    //name
  else if(o.predicate && o.predicate.value === 'http://www.gutenberg.org/2009/pgterms/name') author.name = o.object.value

}


// debug structure
const fn = (o) => console.log(JSON.stringify(o))

myParser.import(myTextStream)
  .on('data', gather)
  .on('error', console.error)
  .on('end', () => {
    console.log(JSON.stringify(book))
    console.log(author)
    console.log('Done')
  })
