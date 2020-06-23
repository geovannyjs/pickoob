const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')


const list = (p) => {

  let content = p.books.map(x => `
  <div style="width: 20%;">
    <img src="/static/content/1/pg1.cover.medium.jpg">
    <br>
    <a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a>
  </div>
  `).join('') + p.paging

  return wrapper({ content })
}

module.exports = list