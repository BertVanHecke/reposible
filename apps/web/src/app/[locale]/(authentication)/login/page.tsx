import { LoginForm } from '@/features/auth/components/login-form';
import { requireNoCurrentUser } from '@/features/auth/actions';
import { APPLICATION_NAME, WEBSITE_URL } from '@/misc/constants';
import ApplicationIcon from '@/components/application-icon';

export default async function LoginPage({ searchParams }: PageProps<'/[locale]/login'>) {
  await requireNoCurrentUser();
  const { redirect } = await searchParams;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href={WEBSITE_URL} className="flex items-center gap-2 self-center font-medium">
          <div className="flex size-6 items-center justify-center rounded-md text-primary-foreground">
            <ApplicationIcon />
          </div>
          <span className="font-semibold">{APPLICATION_NAME}</span>
        </a>
        <LoginForm redirect={redirect} />
      </div>
    </div>
  );
}
