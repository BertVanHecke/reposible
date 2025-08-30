import React, { Fragment } from 'react';
import { Avatar, AvatarImage } from '@repo/ui/components/base/avatar';
import { getCurrentAuthUser } from '@/features/auth/actions';

export default async function NavUserDetails() {
  const user = await getCurrentAuthUser();

  const avatarUrl = user.avatar_url || '';
  const email = user.email;
  const userName = user.full_name;

  return (
    <Fragment>
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} alt={email} />
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{userName}</span>
        <span className="truncate text-xs">{email}</span>
      </div>
    </Fragment>
  );
}
