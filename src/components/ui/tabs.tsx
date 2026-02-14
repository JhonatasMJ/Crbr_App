import { TextClassContext } from '@/components/ui/text'
import { cn } from '@/lib/utils'
import * as TabsPrimitive from '@rn-primitives/tabs'
import React from 'react'
import { Text } from 'react-native'

function Tabs({
  className,
  ...props
}: TabsPrimitive.RootProps & React.RefAttributes<TabsPrimitive.RootRef>) {
  return (
    <TabsPrimitive.Root
      className={cn('flex flex-col gap-4 w-full rounded-md px-6', className)}
      {...props}
    />
  )
}

function TabsList({
  className,
  ...props
}: TabsPrimitive.ListProps & React.RefAttributes<TabsPrimitive.ListRef>) {
  return (
    <TabsPrimitive.List
      className={cn(
        'flex-row bg-secondary rounded-md p-1 w-full',
        className
      )}
      {...props}
    />
  )
}


function TabsTrigger({
  className,
  children,
  value,
  ...props
}: TabsPrimitive.TriggerProps &
  React.RefAttributes<TabsPrimitive.TriggerRef> & {
    children: React.ReactNode
  }) {
  
  const { value: currentValue } = TabsPrimitive.useRootContext()

  const isActive = currentValue === value

  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'flex-1 items-center justify-center rounded-md py-2',
        isActive && 'bg-primary',
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          'text-sm font-medium',
          isActive ? 'text-secondary' : 'text-white'
        )}
      >
        {children}
      </Text>
    </TabsPrimitive.Trigger>
  )
}


function TabsContent({
  className,
  ...props
}: TabsPrimitive.ContentProps & React.RefAttributes<TabsPrimitive.ContentRef>) {
  return (
    <TabsPrimitive.Content
      className={cn('mt-2', className)}
      {...props}
    />
  )
}

export { Tabs, TabsContent, TabsList, TabsTrigger }
