import { RegisterForm } from '@/components/auth/RegisterForm';
import { Container } from '@/components/layout/Container';

export default function RegisterPage() {
  return (
    <Container className="min-h-[calc(100vh-80px)] flex items-center justify-center py-12">
      <div className="w-full">
        <RegisterForm />
      </div>
    </Container>
  );
}