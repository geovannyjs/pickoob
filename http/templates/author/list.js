const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('../book/bookItems')


const list = (p) => {

  let content = p.rows
    .map(x => 
      `<a href="/author/${x.author.unique}/${x.author._id}">${x.author.name}</a>
      <br><br>
      ${bookItems({ books: x.books })}
      <br><br>`
    )
    .join('') + 
    '<br><br>' + paging(p.paging, (page) => p.search ? `/authors?page=${page}&search=${p.search}` : `/authors?page=${page}`)

  return wrapper({ content })

}

module.exports = list