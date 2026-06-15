'use client';

import { withRoleProtection } from '../lib/withRoleProtection';

export const protectRoute = (requiredRoute) => {
  return (Component) => {
    return withRoleProtection(Component, requiredRoute);
  };
};