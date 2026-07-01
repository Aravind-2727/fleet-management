'use client';

export const ROLE_PERMISSIONS = {
  '/dashboard': 'owner',
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
  '/driver/home': 'driver',
  '/driver/mytrip': 'driver',
  '/driver/expenses': 'driver',
  '/driver/advances': 'driver',
  '/driver/pay': 'driver',
};

export const roleGuard = (requiredRole) => {
  return (roleParam) => {
    if (!roleParam || !requiredRole) return false;
    if (requiredRole === 'any') return roleParam === 'owner' || roleParam === 'driver';
    return roleParam === requiredRole;
  };
};

export const canAccessRoute = (route, role) => {
  const matched = Object.entries(ROLE_PERMISSIONS).find(([prefix]) =>
    route === prefix || route.startsWith(prefix + '/')
  );
  return matched ? matched[1] === role : false;
};

export const canAccessModule = (module, role) => {
  return canAccessRoute('/' + module.replace(/^\//, ''), role);
};