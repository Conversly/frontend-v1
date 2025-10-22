export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-svg grid w-full place-items-center">{children}</div>
  );
}
