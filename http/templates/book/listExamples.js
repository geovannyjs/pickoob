
//receive an array of books
const listExamples = (books) => {
    let bookString = ''
    books.forEach(x => {
        bookString = bookString + `<p>${x.title}</p>` //concatenating the titles to return the HTML string
    })
    return bookString
}

module.exports = listExamples