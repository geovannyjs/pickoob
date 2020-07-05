const hashFragmenter = (hash) => {
  
  const sliceInPiecesOfTwo = (str, start) => (start + 2) >= str.length ? 
    str.slice(start) : 
    [str.slice(start, start + 2)].concat(sliceInPiecesOfTwo(str, start + 2))

  let two = sliceInPiecesOfTwo(hash.split('').reverse().join(''), 0)
  return two.slice(0, 6).join('/') + '/' + two.slice(6).join('')

}

module.exports = hashFragmenter