'use client';

import { Button, buttonVariants } from '@repo/ui/components/base/button';
import { Dock, DockIcon } from '@repo/ui/components/base/dock';
import { Separator } from '@repo/ui/components/base/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@repo/ui/components/base/tooltip';
import { cn } from '@repo/ui/lib/utils';
import {
  FlipHorizontal,
  FlipVertical,
  Play,
  Briefcase,
  Terminal,
  Package,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export type IconProps = React.HTMLAttributes<SVGElement>;

const DATA = {
  nodeTypes: [
    { 
      href: '#', 
      icon: Play, 
      label: 'Event', 
      color: 'text-green-500',
      hoverBg: 'hover:bg-green-500',
      hoverBorder: 'hover:border-green-600'
    },
    { 
      href: '#', 
      icon: Briefcase, 
      label: 'Job', 
      color: 'text-blue-500',
      hoverBg: 'hover:bg-blue-500',
      hoverBorder: 'hover:border-blue-600'
    },
    { 
      href: '#', 
      icon: Terminal, 
      label: 'Command', 
      color: 'text-pink-500',
      hoverBg: 'hover:bg-pink-500',
      hoverBorder: 'hover:border-pink-600'
    },
    { 
      href: '#', 
      icon: Package, 
      label: 'Action', 
      color: 'text-purple-500',
      hoverBg: 'hover:bg-purple-500',
      hoverBorder: 'hover:border-purple-600'
    },
  ],
  actions: [
    { href: '#', icon: FlipHorizontal, label: 'Vertical Layout', value: 'TB' },
    { href: '#', icon: FlipVertical, label: 'Horizontal Layout', value: 'LR' },
  ],
};

export function FlowDock({ onLayout }: { onLayout: (direction: 'TB' | 'LR') => void }) {
  return (
    <div className="flex flex-col items-center justify-center">
      <TooltipProvider>
        <Dock direction="middle">
          {DATA.nodeTypes.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className={cn(
                      'group size-12 rounded-full transition-all duration-200 flex items-center justify-center border-2 border-transparent',
                      item.hoverBg,
                      item.hoverBorder
                    )}
                  >
                    <item.icon className={cn('size-4 transition-colors duration-200', item.color, 'group-hover:text-white')} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent className="dark">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
          <Separator orientation="vertical" className="h-full" />
          {DATA.actions.map((item) => (
            <DockIcon key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={'ghost'}
                    onClick={() => onLayout(item.value as 'TB' | 'LR')}
                    aria-label={item.label}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'size-12 rounded-full'
                    )}
                  >
                    <item.icon className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="dark">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </DockIcon>
          ))}
        </Dock>
      </TooltipProvider>
    </div>
  );
}
