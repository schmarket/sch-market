import Link from 'next/link';
import React from 'react';

import config from '../config.json';

export default function Footer() {
  return (
    <footer className="bg-primary-light">
      <div className="bg-primary-medium">
        <div className="max-w-6xl px-8 py-2 mx-auto font-light text-sm text-center">
          {config.footer.copyright}
        </div>
      </div>
    </footer>
  );
}
