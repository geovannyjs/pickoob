const sanitize = require('../../../lib/string/sanitize')

const wrapper = require('../components/wrapper')
const paging = require('../components/paging')
//a

const list = (p) => {

  
  if(p.search == 'invERRORalid'){
    let content = '<div class="pure-g" style="box-sizing: border-box;">' + p.books.map(x => `
    <div class="pure-u-1-5" style="margin: 20px 0; padding: 10px; box-sizing: border-box;">
      <img src="/static/content/1/pg1.cover.medium.jpg" style="display: block; margin: 0 auto;">
      <br>
      <a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a>
    </div>
    `).join('') + '</div><br><br>' + paging(p.paging, (page) => `/books?page=${page}`)  
    return wrapper({ content })
  }

  else{
    let content = '<div class="pure-g" style="box-sizing: border-box;">' + p.books.map(x => `
    <div class="pure-u-1-5" style="margin: 20px 0; padding: 10px; box-sizing: border-box;">
      <img src="/static/content/1/pg1.cover.medium.jpg" style="display: block; margin: 0 auto;">
      <br>
      <a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a>
    </div>
    `).join('') + '</div><br><br>' + paging(p.paging, (page) => `/books?page=${page}&search=${p.search}`)
    return wrapper({ content })
  }
  
  
  

}

module.exports = list