const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')


const list = (p) => {

  let content = p.languages
    .map(x => `<a href="/language/${sanitize(x.code)}/${x._id}">${x.code}</a><br>`).join('') + 
    `<br><br><a href="/languages?page=${p.paging.page + 1}">Proxima</a>`

  return wrapper({ content })
}

module.exports = list