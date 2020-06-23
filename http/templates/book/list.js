const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')


const list = (p) => {

  let content = '<div class="pure-g" style="box-sizing: border-box;">' + p.books.map(x => `
  <div class="pure-u-1-5" style="margin: 20px 0; padding: 10px; box-sizing: border-box;">
    <img src="/static/content/1/pg1.cover.medium.jpg" style="display: block; margin: 0 auto;">
    <br>
    <a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a>
  </div>
  `).join('') + '</div>' + p.paging

  return wrapper({ content })
}

module.exports = list