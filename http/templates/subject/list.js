const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')

const bookItems = require('../book/bookItems')


const list = (p) => {

  let content = p.rows
    .map(x => 
      `<a href="/subject/${sanitize(x.subject.name)}/${x.subject._id}">${x.subject.name}</a>
      <br><br>
      ${bookItems({ books: x.books })}
      <br><br>`
    )
    .join('') + 
    '<br><br>' + paging(p.paging, (page) => p.search ? `/subjects?page=${page}&search=${p.search}` : `/subjects?page=${page}`)

  return wrapper({ content })

}

module.exports = list