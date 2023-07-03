import type { LinksFunction } from '@remix-run/node';
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';

import stylesheet from './tailwind.css';
import { Navbar } from '@components/Navbar';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesheet },
  { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
];

export default function App() {
  return (
    <html lang="en">
      <Head />
      <Body />
    </html>
  );
}

function Head() {
  return (
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <Meta />
      <Links />
    </head>
  );
}

function Body() {
  return (
    <body className="min-h-screen">
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
      <ScrollRestoration />
      <Scripts />
      <LiveReload />
    </body>
  );
}
