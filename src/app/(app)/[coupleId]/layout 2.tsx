'use client';

export default function CoupleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {children}
      <style jsx global>{`
        /* Hide the navbar for this route */
        header {
          display: none !important;
        }
        /* Ensure the main content takes full width */
        main {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
