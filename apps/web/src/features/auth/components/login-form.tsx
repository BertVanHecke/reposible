import { cn } from '@repo/ui/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/base/card';
import OAuthButton, { OAuthButtonProps } from './oauth-button';
import { getTranslations } from 'next-intl/server';
import { DISCORD_SVG, GITHUB_DARK_SVG, GITHUB_LIGHT_SVG } from '@/misc/constants';

import { GOOGLE_SVG } from '@/misc/constants';
import LoginOTPForm from './login-otp-form';

const providers: OAuthButtonProps[] = [
  {
    provider: 'google',
    image: {
      light: { src: GOOGLE_SVG },
      dark: { src: GOOGLE_SVG },
      alt: 'Google',
    },
    text: 'login-with-google',
  },
  {
    provider: 'github',
    image: {
      light: { src: GITHUB_DARK_SVG },
      dark: { src: GITHUB_LIGHT_SVG },
      alt: 'Github',
    },
    text: 'login-with-github',
  },
  {
    provider: 'discord',
    image: {
      light: { src: DISCORD_SVG },
      dark: { src: DISCORD_SVG },
      alt: 'Discord',
    },
    text: 'login-with-discord',
  },
];

export async function LoginForm({
  redirect,
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'> & { redirect?: string | string[] }) {
  const t = await getTranslations();
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t('welcome')}</CardTitle>
          <CardDescription>{t('login-with-your-google-github-or-discord-account')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              {providers.map(({ provider, image: { light, dark, alt }, text }) => (
                <OAuthButton
                  key={provider}
                  provider={provider}
                  image={{ light, dark, alt }}
                  text={text}
                  redirect={redirect}
                />
              ))}
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-card px-2 text-muted-foreground">
                {t('or-login-with')}
              </span>
            </div>
            <LoginOTPForm />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:decoration-dotted [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        {t('by-clicking-continue-you-agree-to-our')}{' '}
        <a target="_blank" rel="noreferrer" href="https://www.reposible.com/legal/terms-of-use">
          {t('terms-of-use')}
        </a>{' '}
        {t('and')}{' '}
        <a target="_blank" rel="noreferrer" href="https://www.reposible.com/legal/privacy-policy">
          {t('privacy-policy')}
        </a>
        .
      </div>
    </div>
  );
}
