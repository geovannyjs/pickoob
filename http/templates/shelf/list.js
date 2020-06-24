const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')


const list = (p) => {

  let content = p.shelves
    .map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('') + 
    `<br><br><a href="/shelves?page=${p.paging.page + 1}">Proxima</a>`

  return wrapper({ content })
}

module.exports = list