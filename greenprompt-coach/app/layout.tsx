import "./globals.css";

export const metadata = {
  title: "Coach AI",
  description: "ChatGPT Style Coach Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased"> 
        {children}
      </body>
    </html>
  );
}
