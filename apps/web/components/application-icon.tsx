import { Fragment } from "react";
import Image from "next/image";
import { APPLICATION_NAME } from "@/../../apps/web/misc/constants";

export default function ApplicationIcon() {
  return (
    <Fragment>
      <Image
        src={"/reposible/reposible-icon-light.svg"}
        alt={`${APPLICATION_NAME} Logo`}
        className="w-full h-full hidden dark:block"
        width={0}
        height={0}
      />
      <Image
        src={"/reposible/reposible-icon-dark.svg"}
        alt={`${APPLICATION_NAME} Logo`}
        className="w-full h-full block dark:hidden"
        width={0}
        height={0}
      />
    </Fragment>
  );
}
