const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')


const list = (p) => {

  let content = p.languages
    .map(x => `<a href="/language/${sanitize(x.code)}/${x._id}">${x.code}</a><br>`).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/languages?page=${page}`)

  return wrapper({ content })
}

module.exports = list