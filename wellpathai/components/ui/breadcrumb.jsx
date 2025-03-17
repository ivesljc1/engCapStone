import * as React from "react";
import { ChevronRightIcon, HomeIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Breadcrumb Container Component
 * 
 * This component serves as the container for breadcrumb items,
 * organizing them in a horizontal list with appropriate spacing.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The breadcrumb items
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered breadcrumb container
 */
const Breadcrumb = React.forwardRef(
  ({ className, ...props }, ref) => (
    <nav 
      ref={ref} 
      aria-label="Breadcrumb" 
      className={cn("flex items-center", className)} 
      {...props} 
    />
  )
);
Breadcrumb.displayName = "Breadcrumb";

/**
 * Breadcrumb List Component
 * 
 * This component renders a list of breadcrumb items.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The breadcrumb items
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered breadcrumb list
 */
const BreadcrumbList = React.forwardRef(
  ({ className, ...props }, ref) => (
    <ol 
      ref={ref} 
      className={cn("flex flex-wrap items-center gap-1.5 break-words text-sm text-gray-500", className)} 
      {...props} 
    />
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

/**
 * Breadcrumb Item Component
 * 
 * This component renders an individual breadcrumb item.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content of the breadcrumb item
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered breadcrumb item
 */
const BreadcrumbItem = React.forwardRef(
  ({ className, ...props }, ref) => (
    <li 
      ref={ref} 
      className={cn("inline-flex items-center gap-1.5", className)} 
      {...props} 
    />
  )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

/**
 * Breadcrumb Separator Component
 * 
 * This component renders a separator between breadcrumb items.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The separator content (defaults to ChevronRight icon)
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered breadcrumb separator
 */
const BreadcrumbSeparator = React.forwardRef(
  ({ className, children = <ChevronRightIcon className="h-4 w-4" />, ...props }, ref) => (
    <li 
      ref={ref} 
      aria-hidden="true" 
      className={cn("text-gray-400", className)} 
      {...props}
    >
      {children}
    </li>
  )
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

/**
 * Breadcrumb Link Component
 * 
 * This component renders a link within a breadcrumb item.
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - The URL the link points to
 * @param {string} props.className - Additional CSS classes
 * @param {React.ReactNode} props.children - The content of the link
 * @param {boolean} props.asChild - Whether to render the child as the root element
 * @returns {JSX.Element} The rendered breadcrumb link
 */
const BreadcrumbLink = React.forwardRef(
  ({ className, href, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn("transition-colors hover:text-gray-900", className)}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

/**
 * Breadcrumb Page Component
 * 
 * This component renders the current page in the breadcrumb,
 * typically the last item that is not a link but just text.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The content of the current page
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered breadcrumb page
 */
const BreadcrumbPage = React.forwardRef(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn("font-normal text-gray-900", className)}
      {...props}
    />
  )
);
BreadcrumbPage.displayName = "BreadcrumbPage";

/**
 * Breadcrumb Home Component
 * 
 * This component renders a home icon link as the first item in the breadcrumb.
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - The URL the home link points to (defaults to "/")
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered home breadcrumb item
 */
const BreadcrumbHome = React.forwardRef(
  ({ className, href = "/", ...props }, ref) => (
    <BreadcrumbLink 
      ref={ref} 
      href={href} 
      className={cn("text-gray-500 hover:text-gray-900", className)}
      {...props}
    >
      <HomeIcon className="h-4 w-4" />
      <span className="sr-only">Home</span>
    </BreadcrumbLink>
  )
);
BreadcrumbHome.displayName = "BreadcrumbHome";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbHome,
}; 