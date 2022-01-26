import React from 'react';
import Countdown from 'react-countdown';
import dayjs from 'dayjs';
import Link from 'next/link';

export default function AuctionListItem({
  id,
  endsAt,
  title,
  maxPrice,
  bids,
  category,
  _count
}) {
  const date = dayjs(endsAt || new Date()).format('D MMMM YYYY')
  const permalink = `/auction/${ id }`

  return (
    <article className="mt-4">
      <Link href={permalink}>
        <a>
          <h2 className="text-3xl font-medium hover:underline inline-block">{title}</h2>
        </a>
      </Link>
      <p className="mt-1 text-base text-gray-500">
        <b className="font-medium">Current bid: ${bids[0].amount}</b> ({_count.bids} bids)
      </p>
      <p className="mt-1 text-sm text-gray-500"><b>Time left:</b> <Countdown date={endsAt} /> <b>|</b> Ends on { endsAt }</p>
    </article>
  );
}
