const sanitize = (s) => s.toLowerCase().replace(/[\s\.\,\'\"\;\:\(\)\[\]\?\!\&\=]{1,}/g, '-')

module.exports = sanitize