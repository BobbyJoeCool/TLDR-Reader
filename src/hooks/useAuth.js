import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => {
    if (import.meta.env.DEV) {
      setUser({ userId: 'dev-user', userDetails: 'dev@local' });
      return;
    }
    fetch('/.auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data.clientPrincipal || null))
      .catch(() => setUser(null));
  }, []);

  const login = () => {
    window.location.href = '/.auth/login/aad?post_login_redirect_uri=/';
  };

  const logout = () => {
    window.location.href = '/.auth/logout?post_logout_redirect_uri=/';
  };

  return { user, login, logout };
}
