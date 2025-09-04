import React, { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@repo/ui/components/base/breadcrumb';
import { Separator } from '@repo/ui/components/base/separator';
import { SidebarTrigger } from '@repo/ui/components/base/sidebar';
import { ThemeSwitcher } from '@repo/ui/components/base/theme-switcher';
import FlowContainer from '@/features/pipelines/components/flow-container';
import { ReactFlowProvider } from '@xyflow/react';

export default async function PipelinesDetailPage({
  params,
}: PageProps<'/[locale]/pipelines/[id]'>) {
  const { id } = await params;
  return (
    <Fragment>
      <header className="flex justify-between h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/pipelines">Pipelines</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{id.charAt(0).toUpperCase() + id.slice(1)}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4">
          <ThemeSwitcher />
        </div>
      </header>
      <ReactFlowProvider>
        <FlowContainer />
      </ReactFlowProvider>
    </Fragment>
  );
}
