import React, { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@repo/ui/components/base/breadcrumb';
import { Separator } from '@repo/ui/components/base/separator';
import { SidebarTrigger } from '@repo/ui/components/base/sidebar';
import { ThemeSwitcher } from '@repo/ui/components/base/theme-switcher';
import Link from 'next/link';
import { Button } from '@repo/ui/components/base/button';

export default function PipelinesPage() {
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
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="px-4">
          <ThemeSwitcher />
        </div>
      </header>

      <div className="flex-1 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Hero Section */}
        <div className="h-full relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-gray-100 to-gray-300 dark:from-black/10 dark:via-gray-900/5 dark:to-gray-600/10 border-b">
          <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">
            <div className="text-center">
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-4xl">
                Build Powerful Pipelines
              </h1>
              <p className="mt-2 text-sm leading-7 text-muted-foreground max-w-2xl mx-auto">
                Explore our visual pipeline builder with this interactive demo. Drag, drop, and
                connect nodes to see how workflows come together.
              </p>
              <div className="mt-6 flex items-center justify-center gap-4">
                <Button asChild variant={'default'}>
                  <Link href="/pipelines/demo">Explore demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
