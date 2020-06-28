
const sanitize = require('../../../lib/string/sanitize')


//receive an array of books
const listExamples = (books) => {
    let bookString = ''
    books.forEach(x => {
        bookString = bookString + `<a href="/book/${sanitize(x.title)}/${x._id}">${x.title}</a><br>` //concatenating the titles to return the HTML string
    })
    return bookString
}

module.exports = listExamples