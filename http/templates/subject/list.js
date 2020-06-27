const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')


const list = (p) => {

  let content = p.subjects
    .map(x => `<a href="/subject/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/subjects?page=${page}`)

  return wrapper({ content })
}

module.exports = list