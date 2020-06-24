const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')


const list = (p) => {

  let content = p.authors
    .map(x => `<a href="/author/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('') + 
    `<br><br><a href="/authors?page=${p.paging.page + 1}">Proxima</a>`

  return wrapper({ content })
}

module.exports = list