'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  HomeIcon,
  ChartPieIcon,
  CalendarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Home', href: '/dashboard', icon: HomeIcon },
  { name: 'Reports', href: '/dashboard/reports', icon: ChartPieIcon },
  { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
  { name: 'Profile', href: '/dashboard/profile', icon: UsersIcon },
]

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Navigation() {
  const pathname = usePathname()

  return (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => {
        const isActive = pathname === item.href
        
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={classNames(
                isActive
                  ? 'bg-gray-50 text-primary-hover'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-primary-hover',
                'group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold',
              )}
            >
              <item.icon
                aria-hidden="true"
                className={classNames(
                  isActive ? 'text-primary-hover' : 'text-gray-400 group-hover:text-primary-hover',
                  'size-6 shrink-0',
                )}
              />
              {item.name}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export default Navigation
