export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative h-screen w-full flex-col items-center justify-center grid lg:grid-cols-2">
      {children}
    </div>
  );
} 