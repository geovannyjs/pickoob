const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('../book/bookItems')


const list = (p) => {

  let content = p.object
    .map(x => 
      `<a href="/author/${sanitize(x.author.name)}/${x.author._id}">${x.author.name}</a>
      <br><br>
      ${bookItems({ books: x.books })}
      <br><br>`
    )
    .join('') + 
    '<br><br>' + paging(p.paging, (page) => p.search ? `/authors?page=${page}&search=${p.search}` : `/authors?page=${page}`)

  return wrapper({ content })

}

module.exports = list