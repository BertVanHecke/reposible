import { Badge } from '@repo/ui/components/base/badge';
import { useTranslations } from 'next-intl';
import React from 'react';

export default function LastUsedBadge({ isLastUsed }: { isLastUsed: boolean }) {
  const t = useTranslations();
  return (
    isLastUsed && (
      <Badge className="absolute -top-2 -right-2 shadow-sm">
        {t('auth.lastUsed')}
      </Badge>
    )
  );
}
