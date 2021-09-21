const adminAccess = async (req, res, next) => {
  if (req.get('profile_id') !== 'admin') {
    return res.status(401).end()
  }

  req.profile = { name: 'John' }
  next()
}

module.exports = adminAccess
