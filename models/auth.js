// Authentication middleware
function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.user) {
      return next()
    }
  
    // Store the original URL to redirect back after login
    req.session.returnTo = req.originalUrl
  
    // Redirect to login page with a message
    res.redirect("/login?message=Please log in to access this page")
  }
  
  // Export the middleware
  module.exports = {
    ensureAuthenticated,
  }
  
  