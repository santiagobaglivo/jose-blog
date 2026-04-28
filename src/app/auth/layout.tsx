export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex-1 flex items-center justify-center bg-gradient-to-b from-secondary/40 to-transparent px-6 py-12">
      {children}
    </main>
  );
}
