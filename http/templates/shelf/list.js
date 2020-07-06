const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('../book/bookItems')


const list = (p) => {

  let content = p.object
    .map(x => 
      `<a href="/shelf/${sanitize(x.shelf.name)}/${x.shelf._id}">${x.shelf.name}</a>
      <br><br>
      ${bookItems({ books: x.books })}
      <br><br>`
    )
    .join('') + 
    '<br><br>' + paging(p.paging, (page) => p.search ? `/shelves?page=${page}&search=${p.search}` : `/shelves?page=${page}`)

  return wrapper({ content })

}

module.exports = list