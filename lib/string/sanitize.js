const sanitize = (s) => s.toLowerCase().replace(/([\s\.\,\'\"\;\:\(\)\[\]\?\!\&\=\-]){1,}/g, '-').replace(/^-|-$/g, '')

module.exports = sanitize