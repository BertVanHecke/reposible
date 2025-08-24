import { Fragment } from 'react';
import Image from 'next/image';
import { APPLICATION_NAME, REPOSIBLE_DARK_SVG, REPOSIBLE_LIGHT_SVG } from '@/misc/constants';

export default function ApplicationIcon() {
  return (
    <Fragment>
      <Image
        src={REPOSIBLE_LIGHT_SVG}
        alt={`${APPLICATION_NAME} Logo`}
        className="w-full h-full hidden dark:block"
        width={0}
        height={0}
      />
      <Image
        src={REPOSIBLE_DARK_SVG}
        alt={`${APPLICATION_NAME} Logo`}
        className="w-full h-full block dark:hidden"
        width={0}
        height={0}
      />
    </Fragment>
  );
}
