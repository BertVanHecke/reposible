import * as React from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@repo/ui/components/base/sidebar';
import NavUserDetails from './nav-user-details';
import { NavMain } from './nav-main';
import { NavUser } from './nav-user';
import packageInfo from '../../package.json';
import ApplicationIcon from './application-icon';
import { Link } from '@/i18n/navigation';

export async function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton size="lg">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <ApplicationIcon />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Reposible</span>
                  <span className="text-xs">v{packageInfo.version}</span>
                </div>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
      </SidebarContent>
      <SidebarFooter>
        <NavUser>
          <NavUserDetails />
        </NavUser>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
