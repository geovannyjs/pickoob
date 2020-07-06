const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('../book/bookItems')


const list = (p) => {

  if(p.search=='invERRORalid'){

  let content = p.object
    .map(x => `<a href="/subject/${sanitize(x.language.code)}/${x.language._id}">${x.language.code}</a><br><br> ${bookItems({ books: x.books })} <br><br> `).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/languages?page=${page}`)

  return wrapper({ content })
  }
  else{
  let content = p.object
    .map(x => `<a href="/subject/${sanitize(x.language.code)}/${x.language._id}">${x.language.code}</a><br><br> ${bookItems({ books: x.books })} <br><br> `).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/languages?page=${page}&search=${p.search}`)

  return wrapper({ content })
  }
}

module.exports = list