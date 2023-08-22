// hooks/useAuthToken.js
import { useEffect, useState } from 'react';

function useAuthToken() {
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  return token;
}

export default useAuthToken;
