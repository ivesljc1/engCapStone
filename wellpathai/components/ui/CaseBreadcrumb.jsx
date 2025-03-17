"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbSeparator,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbHome
} from "./breadcrumb";

/**
 * CaseBreadcrumb Component
 * 
 * This component handles breadcrumb navigation for the user cases section.
 * It dynamically updates based on the current path and shows appropriate
 * navigation links.
 * 
 * On dashboard: Home icon > Home
 * On case page: Home icon > Home > Case name
 * 
 * @param {Object} props - Component props 
 * @param {string} props.caseName - The name of the current case (if viewing a specific case)
 * @returns {JSX.Element} The rendered breadcrumb navigation
 */
export default function CaseBreadcrumb({ caseName }) {
  const pathname = usePathname();
  
  // Determine if we're on the dashboard or case page
  const isDashboard = pathname === "/dashboard";
  const isCasePage = pathname.includes("/dashboard/cases/");
  
  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {/* Home icon is always the first item */}
        <BreadcrumbItem>
          <BreadcrumbHome />
        </BreadcrumbItem>
        
        <BreadcrumbSeparator />
        
        {/* Home text is always second item */}
        <BreadcrumbItem>
          {isDashboard ? (
            <BreadcrumbPage>Home</BreadcrumbPage>
          ) : (
            <Link href="/dashboard" passHref legacyBehavior>
              <BreadcrumbLink>Home</BreadcrumbLink>
            </Link>
          )}
        </BreadcrumbItem>
        
        {/* If on case page, show Case name directly */}
        {isCasePage && caseName && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{caseName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
} 