import { useAuth } from '@/contexts/AuthContext';

const ADMIN_EMAILS = ['edemilso-cardoso2@hotmail.com'];

export function useAdmin() {
  const { user } = useAuth();
  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase()));
  return { isAdmin };
}
