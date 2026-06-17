'use client';

export const roleGuard = (requiredRole) => {
  return (userRole) => {
    if (!userRole) return false;
    
    if (requiredRole === 'owner') {
      return userRole === 'owner';
    }
    
    if (requiredRole === 'driver') {
      return userRole === 'driver';
    }
    
    if (requiredRole === 'any') {
      return userRole === 'owner' || userRole === 'driver';
    }
    
    return false;
  };
};

export const canAccessRoute = (route, userRole) => {
  const routePermissions = {
    '/dashboard': 'any',
    '/driver/home': 'driver',
    '/driver/mytrip': 'driver',
    '/trips': 'owner',
    '/trips-management': 'owner',
    '/drivers': 'owner',
    '/trucks': 'owner',
    '/expenses': 'owner',
    '/advances': 'owner',
    '/settlements': 'owner',
    '/payments': 'owner',
    '/reports': 'owner',
    '/settings': 'owner',
  };

  return routePermissions[route] ? roleGuard(routePermissions[route])(userRole) : false;
};

export const canAccessModule = (module, userRole) => {
  const modulePermissions = {
    'dashboard': 'any',
    'driver/home': 'driver',
    'driver/mytrip': 'driver',
    'trips': 'owner',
    'trips-management': 'owner',
    'drivers': 'owner',
    'trucks': 'owner',
    'expenses': 'owner',
    'advances': 'owner',
    'settlements': 'owner',
    'payments': 'owner',
    'reports': 'owner',
    'settings': 'owner',
  };

  return modulePermissions[module] ? roleGuard(modulePermissions[module])(userRole) : false;
};