import type { ReactNode } from "react";
import { useAuth } from "react-oidc-context";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: string[];
  fallback?: ReactNode;
}

function RoleGuard({
  children,
  allowedRoles,
  fallback = null,
}: RoleGuardProps) {
  const auth = useAuth();

  if (auth.isLoading) {
    return null;
  }

  if (!auth.isAuthenticated) {
    return <>{fallback}</>;
  }

  const roles =
    (auth.user?.profile["cognito:groups"] as string[]) || [];

  if (
    allowedRoles &&
    !allowedRoles.some((role) => roles.includes(role))
  ) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default RoleGuard;