
import { redirect } from 'next/navigation';

export default function HomePage() {
  redirect('/dashboard');
  // return null; // redirect will stop rendering, but for completeness.
}
