import { Outfit, Space_Grotesk } from 'next/font/google';
import { AuthProvider } from './lib/AuthContext';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-outfit',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
});

export const metadata = {
  title: 'Fleet Management',
  description: 'Fleet Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}