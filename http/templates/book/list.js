const hashFragmenter = require('../../../lib/cdn/hashFragmenter')
const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('./bookItems')


const list = (p) => {

  let content = bookItems({ books: p.books }) + '<br><br>' + 
    paging(p.paging, (page) => p.search ? `/books?page=${page}&search=${p.search}` : `/books?page=${page}`)  
  
  return wrapper({ content })

}

module.exports = list