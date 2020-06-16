const fsPromises = require('fs').promises
const path = require('path')


// readdir function
const readFilesRecursively = (dirPath, fn) => fsPromises.readdir(dirPath)
  .then(files => 
    files.forEach(file => {
      let f = path.join(dirPath, file)
      fsPromises.stat(f).then(fst => fst.isDirectory() ? readFilesRecursively(f, fn) : fn(f))
    })
  )

module.exports = readFilesRecursively