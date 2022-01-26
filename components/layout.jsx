import Head from 'next/head';
import React from 'react';

import config from '../config.json';

import Header from './header';
import Footer from './footer';

export default function Layout({
  children,
  title,
}) {
  return (
    <>
      <Head>
        <title>{title} - {config.meta.title}</title>
        <meta name="description" content={config.meta.description} />
        <meta property="og:title" content={title} />
        <meta property="og:site_name" content="Product Log" />
        <meta property="og:description" content={config.meta.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@apvarun" />
        <meta property="og:image" content={config.meta.image} />
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com"></link>
        <link
          href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        ></link>
      </Head>
      <Header />
      <main className="p-8 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-2 lg:gap-4">
        {children}
      </main>
      <Footer />
    </>
  );
}
