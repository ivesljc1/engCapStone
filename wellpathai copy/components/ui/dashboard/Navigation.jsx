"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  ChartPieIcon,
  CalendarIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

const navigation = [
  { name: "Home", href: "/dashboard", icon: HomeIcon },
  { name: "Appointments", href: "/dashboard/appointments", icon: CalendarIcon },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Navigation() {
  const pathname = usePathname();

  return (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => {
        // Check if this is the Home link and if we're on a cases page
        const isHomeLinkAndOnCasePage =
          item.href === "/dashboard" &&
          (pathname.startsWith("/dashboard/cases/") ||
            pathname === "/dashboard");

        // For other items, check exact match as before
        const isExactMatch = pathname === item.href;

        // Combine both conditions
        const isActive =
          item.href === "/dashboard" ? isHomeLinkAndOnCasePage : isExactMatch;

        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={classNames(
                isActive
                  ? "bg-gray-50 text-primary-hover"
                  : "text-gray-700 hover:bg-gray-50 hover:text-primary-hover",
                "group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold"
              )}
            >
              <item.icon
                aria-hidden="true"
                className={classNames(
                  isActive
                    ? "text-primary-hover"
                    : "text-gray-400 group-hover:text-primary-hover",
                  "size-6 shrink-0"
                )}
              />
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default Navigation;
