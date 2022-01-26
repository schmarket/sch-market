import { useEffect, useState } from 'react'
import Link from 'next/link';
import { getCookie } from 'cookies-next';

import config from '../config.json';

export default function Header() {
  const [userCookie, setUserCookie] = useState('userCookie')
  
  useEffect(() => setUserCookie(getCookie('user')), [])

  return (
    <header className="bg-primary-light">
      <div className="flex items-center justify-between max-w-6xl p-8 mx-auto">
        <Link href="/">
          <h1>
            <a className="font-medium flex gap-2 text-5xl mb-4">
              <span>{config.logo.text}</span>
            </a>
          </h1>
        </Link>

        <nav className="flex gap-4">
          {!userCookie && <div className="group relative">
            <Link href="/login" key="login">
              <a className="px-3 py-2 rounded bg-primary-dark hover:bg-gray-400 transition-colors">Login</a>
            </Link>
            <Link href="/signup" key="signup">
              <a className="px-3 py-2 rounded bg-primary-dark hover:bg-gray-400 transition-colors">Sign Up</a>
            </Link>
          </div>}

          {userCookie && <div className="group relative">
            <Link href="/post" key="post">
              <a className="px-3 py-2 rounded bg-primary-dark hover:bg-gray-400 transition-colors">Post</a>
            </Link>
          </div>}
        </nav>
      </div>
    </header>
  );
}
