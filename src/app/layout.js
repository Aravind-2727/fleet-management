import "./globals.css";

export const metadata = {
  title: "Fleet Management",
  description: "Fleet Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}