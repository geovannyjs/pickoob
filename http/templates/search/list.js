const wrapper = require('../components/wrapper')


const list = (p) => {

  let content = p.books.map(x => `<a href="/book/${x.unique}/${x._id}" title="${x.title}">${x.title}</a><br>`).join('') + '<br><br>' +
    p.subjects.map(x => `<a href="/subject/${x.unique}/${x._id}" title="${x.name}">${x.name}</a><br>`).join('') + '<br><br>' +
    p.authors.map(x => `<a href="/author/${x.unique}/${x._id}" title="${x.name}">${x.name}</a><br>`).join('') + '<br><br>' +
    p.languages.map(x => `<a href="/language/${x.code}/${x._id}" title="${x.code}">${x.code}</a><br>`).join('') + '<br><br>' +
    p.shelves.map(x => `<a href="/shelf/${x.unique}/${x._id}" title="${x.name}">${x.name}</a><br>`).join('')
  
  return wrapper({ content })

}

module.exports = list