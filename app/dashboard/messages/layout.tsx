export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
      {children}
    </div>
  );
}
