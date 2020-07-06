const wrapper = require('../components/wrapper')


const view = (b) => {
  let content = `
<h1>${b.name}</h1>
  `
  return wrapper({ content, title: b.name })
}

module.exports = view