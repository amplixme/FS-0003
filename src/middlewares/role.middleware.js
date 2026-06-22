const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        error: { message: 'No tienes permisos para realizar esta acción' }
      });
    }

    const userRole = req.user.role;
    const hasPermission = allowedRoles.includes(userRole);

    if (!hasPermission) {
      return res.status(403).json({
        error: { message: 'No tienes permisos para realizar esta acción' }
      });
    }

    next();
  };
};

module.exports = { requireRole };