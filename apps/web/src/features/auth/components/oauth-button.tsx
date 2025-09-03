'use client';
import React, { Fragment, useEffect, useState } from 'react';
import Image from 'next/image';
import { Provider } from '@supabase/supabase-js';
import { StaticImport } from 'next/dist/shared/lib/get-img-props';
import { loginWithOAuth } from '@/features/auth/actions';
import { useTranslations } from 'next-intl';
import { Button } from '@repo/ui/components/base/button';
import { Badge } from '@repo/ui/components/base/badge';
import { localStorageKeys } from '@/misc/constants';
import { toast } from 'sonner';

export type OAuthButtonProps = {
  provider: Provider;
  image: {
    light: {
      src: string | StaticImport;
    };
    dark: {
      src: string | StaticImport;
    };
    alt: string;
  };
  text: string;
  redirect?: string;
};

export default function OAuthButton({
  provider,
  image: { light, dark, alt },
  text,
  redirect,
}: OAuthButtonProps) {
  const t = useTranslations();
  const [isLastUsed, setIsLastUsed] = useState(false);

  useEffect(() => {
    const lastUsedAuth = localStorage.getItem(localStorageKeys.lastUsedAuth);
    setIsLastUsed(lastUsedAuth === provider);
  }, [provider]);

  async function handleOAuthLogin(provider: Provider, redirect?: string) {
    try {
      await loginWithOAuth(provider, redirect);
      localStorage.setItem(localStorageKeys.lastUsedAuth, provider);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => handleOAuthLogin(provider, redirect)}
      >
        <Fragment>
          <Image
            src={light.src}
            alt={alt}
            width={0}
            height={0}
            className="mr-2 size-5 block dark:hidden"
          />
          <Image
            src={dark.src}
            alt={alt}
            width={0}
            height={0}
            className="mr-2 size-5 hidden dark:block"
          />
        </Fragment>
        {t(text)}
      </Button>
      {isLastUsed && (
        <Badge className="absolute -top-2 -right-2 shadow-sm">{t('auth.lastUsed')}</Badge>
      )}
    </div>
  );
}
