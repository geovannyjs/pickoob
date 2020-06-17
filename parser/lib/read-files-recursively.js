const fs = require('fs')
const path = require('path')


// readdir function
const readFilesRecursively = (dirPath, fn, cb) => fs.opendir(dirPath, (err, dir) => {

  const next = () => {
    let ent = dir.readSync()
    if(ent) {
      let f = path.join(dir.path, ent.name)
      fs.stat(f, (err, stats) => {
        if(stats.isDirectory()) readFilesRecursively(f, fn, next)
        else fn(f, next)
      })
    } else {
      dir.close()
      !!cb && cb()
    }
  }
  
  next()

})

module.exports = readFilesRecursively