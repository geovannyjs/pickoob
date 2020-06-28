const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')
const listExamples = require('../book/listExamples')

const list = (p) => {
  if(p.search == 'invERRORalid'){
    let content = p.object
    .map(x => `<a href="/subject/${sanitize(x.subject.name)}/${x.subject._id}">${x.subject.name}</a><br><br> ${listExamples(x.books)} <br><br> `).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/subjects?page=${page}`)

  return wrapper({ content })
  }
  else{
    let content = p.object
    .map(x => `<a href="/subject/${sanitize(x.subject.name)}/${x.subject._id}">${x.subject.name}</a><br><br> ${listExamples(x.books)} <br><br> `).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/subjects?page=${page}&search=${p.search}`)

  return wrapper({ content })
  }

}

module.exports = list