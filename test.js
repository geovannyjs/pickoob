const fs = require('fs')
const RdfXmlParser = require("rdfxml-streaming-parser").RdfXmlParser


const myParser = new RdfXmlParser()

const myTextStream = fs.createReadStream('/tmp/gutenberg/1/pg1.rdf')

myParser.import(myTextStream)
  .on('data', console.log)
  .on('error', console.error)
  .on('end', () => console.log('All triples were parsed!'))
