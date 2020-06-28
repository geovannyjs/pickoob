

const listExamples = (books) => {
    let bookString = ''
    books.forEach(x => {
        bookString = bookString + `<p>${x.title}</p>`
    })
    return bookString
}

module.exports = listExamples