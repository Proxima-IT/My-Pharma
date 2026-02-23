import PublicGuard from '../components/PublicGuard';

export default function AuthPagesLayout({ children }) {
  return <PublicGuard>{children}</PublicGuard>;
}
