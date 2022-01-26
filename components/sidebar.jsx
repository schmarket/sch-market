import Link from 'next/link'
import React from 'react'

export default function Sidebar({ categories }) {
  return (
    <div className="flex flex-col">
      <h2 className="font-medium text-2xl flex gap-2 mb-8">Categories</h2>
      {categories.map(category => (
        <Link href={`/category/${category.slug}`} key={category.slug}>
          <a className="text-xl mb-4">{category.name}</a>
        </Link>
      ))}
    </div>
  )
}
