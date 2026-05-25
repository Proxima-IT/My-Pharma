import { redirect } from 'next/navigation';

export default function ProductIndexRedirectPage() {
  redirect('/products');
}
