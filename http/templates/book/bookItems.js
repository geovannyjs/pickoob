const hashFragmenter = require('../../../lib/cdn/hashFragmenter')


const bookItems = (p) => '<div class="pure-g" style="box-sizing: border-box;">' + p.books.map(x => `
  <div class="pure-u-1 pure-u-md-1-3 pure-u-lg-1-5" style="margin: 20px 0; padding: 10px; box-sizing: border-box;">
    <a href="/book/${x.unique}/${x._id}" title="${x.title}">
      <img src="https://pickoob.ams3.cdn.digitaloceanspaces.com/content/books/${hashFragmenter(x._id.toString())}/cover.jpg" style="display: block; margin: 0 auto;" title="${x.title}" alt="${x.title}">
      <br>
      ${x.title}
    </a>
  </div>
`).join('') + '</div>'


module.exports = bookItems