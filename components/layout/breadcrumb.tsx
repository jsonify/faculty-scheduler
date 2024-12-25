// components/layout/breadcrumb.tsx

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";

export function StaffBreadcrumb() {
  const pathname = usePathname();
  
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean);
    return paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`;
      return {
        href,
        label: path.charAt(0).toUpperCase() + path.slice(1)
      };
    });
  };

  return (
    <Breadcrumb>
      {getBreadcrumbs().map((crumb, index) => (
        <BreadcrumbItem key={crumb.href}>
          <BreadcrumbLink href={crumb.href}>
            {crumb.label}
          </BreadcrumbLink>
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}