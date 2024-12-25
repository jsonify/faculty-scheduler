// app/dashboard/staff/layout.tsx

export default function StaffLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className="space-y-6">
        <div className="container mx-auto max-w-7xl">
          {children}
        </div>
      </div>
    );
  }