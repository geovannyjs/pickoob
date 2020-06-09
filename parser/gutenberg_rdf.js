const fs = require('fs')
const RdfXmlParser = require("rdfxml-streaming-parser").RdfXmlParser

if(!process.argv[2]) throw new Error('You must pass the RDF file as parameter')

const myParser = new RdfXmlParser()
const myTextStream = fs.createReadStream(process.argv[2])


let book = {
  source: {
    type: "gutenberg"
  }
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
}


myParser.import(myTextStream)
  .on('data', gather)
  .on('error', console.error)
  .on('end', () => {
    console.log(JSON.stringify(book))
    console.log('Done')
  })
