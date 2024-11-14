import { useEffect, useState } from 'react';

import PropTypes from 'prop-types';

import { UserContext } from '../contexts/UserContext';
import API from '../services/API';

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await API.getUserInfo();
        setUser(user);
      } catch {
        console.error('Failed to get user info');
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  if (loading) return null;

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
