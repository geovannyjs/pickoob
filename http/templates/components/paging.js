const R = require('ramda')


const paging = (p, href, searchGoal) => {

  let first = `<a href="${href(p.first)}" class="pure-button" title="First">&laquo;</a>`,
    previous = `<a href="${href(p.previous)}" class="pure-button" title="Previous">&lsaquo;</a>`,
    next = `<a href="${href(p.next)}" class="pure-button" title="Next">&rsaquo;</a>`,
    last = `<a href="${href(p.last)}" class="pure-button" title="Last">&raquo;</a>`

  let pageRange = R.range(R.max(p.first, p.page - 3), R.min(p.last + 1, p.page + 4))
    .map(l => `<a href="${href(l)}" class="pure-button" title="${l}" ${(l == p.page) ? 'disabled="disabled"' : ''}>${l}</a>`).join(' ')

  return `
  <nav>
    <small>Displaying ${p.skip+1} to ${(p.skip+p.limit) >= p.rows ? p.rows : p.skip+p.limit} of ${p.rows}</small><br>
    ${(p.page > p.first) ? (first + ' ' + previous) : ''}
    ${pageRange}
    ${(p.page < p.last) ? (next + ' ' + last) : ''}
  </nav>
  `
}

module.exports = paging