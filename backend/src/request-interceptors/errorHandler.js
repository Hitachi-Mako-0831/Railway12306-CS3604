module.exports = (err, req, res, next) => {
  if (res.headersSent) return next(err)
  const status = err.status || 500
  const payload = err.payload || { error: 'Something went wrong!' }
  res.status(status).json(payload)
}
