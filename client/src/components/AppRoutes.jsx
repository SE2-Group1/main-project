import { useUserContext } from '../contexts/UserContext';
import { GuestRoutes } from './GuestRoutes.jsx';
import { UserRoutes } from './UserRoutes.jsx';

export const AppRoutes = () => {
  const { user } = useUserContext();
  return user ? <UserRoutes /> : <GuestRoutes />;
};
