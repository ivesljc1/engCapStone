import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { HomeIcon } from "@heroicons/react/24/outline"

import { cn } from "@/lib/utils"

const Breadcrumb = React.forwardRef(
  ({ ...props }, ref) => <nav ref={ref} aria-label="breadcrumb" {...props} />
)
Breadcrumb.displayName = "Breadcrumb"

const BreadcrumbList = React.forwardRef(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5",
      className
    )}
    {...props} />
))
BreadcrumbList.displayName = "BreadcrumbList"

const BreadcrumbItem = React.forwardRef(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5", className)}
    {...props} />
))
BreadcrumbItem.displayName = "BreadcrumbItem"

const BreadcrumbLink = React.forwardRef(({ asChild, href, className, ...props }, ref) => {
  // If asChild is true, use Slot, otherwise use Link from next/link
  const Comp = asChild ? Slot : Link

  // If we're using Link, include the href in the props for Link
  const linkProps = !asChild && href ? { href } : {}

  return (
    <Comp
      ref={ref}
      className={cn("transition-colors hover:text-foreground", className)}
      {...linkProps}
      {...props} 
    />
  );
})
BreadcrumbLink.displayName = "BreadcrumbLink"

const BreadcrumbPage = React.forwardRef(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-normal text-foreground", className)}
    {...props} />
))
BreadcrumbPage.displayName = "BreadcrumbPage"

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("[&>svg]:w-3.5 [&>svg]:h-3.5", className)}
    {...props}>
    {children ?? <ChevronRight />}
  </li>
)
BreadcrumbSeparator.displayName = "BreadcrumbSeparator"

const BreadcrumbEllipsis = ({
  className,
  ...props
}) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}>
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">More</span>
  </span>
)
BreadcrumbEllipsis.displayName = "BreadcrumbElipssis"

/**
 * Breadcrumb Home Component
 * 
 * This component renders a home icon link as the first item in the breadcrumb.
 * Uses the same HomeIcon as the sidebar navigation to maintain consistency.
 * 
 * @param {Object} props - Component props
 * @param {string} props.href - The URL the home link points to (defaults to "/dashboard")
 * @param {string} props.className - Additional CSS classes
 * @returns {JSX.Element} The rendered home breadcrumb item
 */
const BreadcrumbHome = React.forwardRef(
  ({ className, href = "/dashboard", ...props }, ref) => (
    <Link href={href} passHref legacyBehavior>
      <BreadcrumbLink 
        ref={ref}
        className={cn("text-muted-foreground hover:text-foreground", className)}
        {...props}
      >
        <HomeIcon className="h-5 w-5" />
        <span className="sr-only">Home</span>
      </BreadcrumbLink>
    </Link>
  )
);
BreadcrumbHome.displayName = "BreadcrumbHome";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  BreadcrumbHome,
}
