"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

/**
 * Navigation items for the admin section
 * Each item has a name, target URL, and an icon from Heroicons
 */
const navigation = [
  { name: "Home", href: "/admin", icon: HomeIcon },
  { name: "Profile", href: "/admin/profile", icon: UserIcon },
];

/**
 * Helper function to combine CSS classes conditionally
 * @param {...string} classes - CSS class names to combine
 * @returns {string} Combined class names with spaces removed
 */
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

/**
 * AdminNavigation Component - Renders the navigation links for the admin section
 * 
 * This component displays a list of navigation links with icons.
 * The active link is highlighted based on the current URL pathname.
 * 
 * @returns {JSX.Element} The rendered navigation component
 */
function AdminNavigation() {
  // Get current pathname to determine active link
  const pathname = usePathname();

  return (
    <ul role="list" className="-mx-2 space-y-1">
      {navigation.map((item) => {
        // Check if current path matches this navigation item
        const isActive = pathname === item.href;

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

export default AdminNavigation; 