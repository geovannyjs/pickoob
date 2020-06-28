const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')


const list = (p) => {

  if(p.search == 'invERRORalid'){
  let content = p.shelves
    .map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/shelves?page=${page}`)

    return wrapper({ content })
  }
  else{
    let content = p.shelves
    .map(x => `<a href="/shelf/${sanitize(x.name)}/${x._id}">${x.name}</a><br>`).join('') + 
    '<br><br>' + paging(p.paging, (page) => `/shelves?page=${page}&search=${p.search}`)

  return wrapper({ content })    
  }
}

module.exports = list