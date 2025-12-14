import { LoginForm } from '@/components/auth/LoginForm';
import { Container } from '@/components/layout/Container';

export default function LoginPage() {
  return (
    <Container className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12">
      <div className="w-full">
        <LoginForm />
      </div>
    </Container>
  );
}