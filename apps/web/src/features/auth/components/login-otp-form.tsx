'use client';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginWithOTP } from '../actions';
import { useTranslations } from 'next-intl';
import { APPLICATION_NAME, localStorageKeys } from '@/misc/constants';
import { Button } from '@repo/ui/components/base/button';
import { Badge } from '@repo/ui/components/base/badge';
import { RoundSpinner } from '@repo/ui/components/base/spinner';
import { Input } from '@repo/ui/components/base/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui/components/base/form';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/navigation';

const lastUsedAuthMethod = 'email';

const formSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

type LoginOTPFormData = z.infer<typeof formSchema>;

export default function LoginOTPForm() {
  const t = useTranslations();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLastUsed, setIsLastUsed] = useState(false);

  const form = useForm<LoginOTPFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  useEffect(() => {
    const lastUsedAuth = localStorage.getItem(localStorageKeys.lastUsedAuth);
    setIsLastUsed(lastUsedAuth === lastUsedAuthMethod);
  }, []);

  async function onSubmit({ email }: LoginOTPFormData) {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('email', email);

      await loginWithOTP(formData);
      localStorage.setItem(localStorageKeys.lastUsedAuth, lastUsedAuthMethod);
      router.push('/login/otp-success');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={`hello@${APPLICATION_NAME.toLowerCase()}.com`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="relative">
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <RoundSpinner size="sm" />}
            {isSubmitting ? t('sending-email') : t('login')}
          </Button>
          {isLastUsed && (
            <Badge className="absolute -top-2 -right-2 shadow-sm">{t('auth.lastUsed')}</Badge>
          )}
        </div>
      </form>
    </Form>
  );
}
