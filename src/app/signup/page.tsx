import NavBar from '@/app/components/NavBar';
import { AuthForm } from '@/app/components/auth-form';

export default function SignupPage() {
  return (
    <>
      <NavBar />
      <main className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 mt-20">
        <AuthForm />
      </main>
    </>
  );
}
