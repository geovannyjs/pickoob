const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('../book/bookItems')


const list = (p) => {

  let content = p.rows
    .map(x => 
      `<a href="/shelf/${x.shelf.unique}/${x.shelf._id}">${x.shelf.name}</a>
      <br><br>
      ${bookItems({ books: x.books })}
      <br><br>`
    )
    .join('') + 
    '<br><br>' + paging(p.paging, (page) => p.search ? `/shelves?page=${page}&search=${p.search}` : `/shelves?page=${page}`)

  return wrapper({ content })

}

module.exports = list