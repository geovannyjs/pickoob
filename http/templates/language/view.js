const wrapper = require('../components/wrapper')


const view = (b) => {
  let content = `
<h1>${b.code}</h1>
  `
  return wrapper({ content })
}

module.exports = view