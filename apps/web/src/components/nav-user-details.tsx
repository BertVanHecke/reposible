import React, { Fragment } from 'react';
import { createClient } from '@/lib/supabase/factories/server';
import { Avatar, AvatarImage } from '@repo/ui/components/base/avatar';

export default async function NavUserDetails() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const avatarUrl = user?.user_metadata?.avatar_url;
  const email = user?.email;
  const userName = user?.user_metadata?.user_name;

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
