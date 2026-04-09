"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  className: string;
  children: React.ReactNode;
};

/**
 * Same-route hash links (e.g. / → /#get-reading) do not scroll with default Next Link; handle explicitly.
 */
export default function ReadingNavLink({ href, className, children }: Props) {
  const pathname = usePathname();

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    const hash = href.includes("#") ? href.split("#")[1] : "";
    if (!hash) return;
    e.preventDefault();
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", `/#${hash}`);
    } else {
      window.location.href = href;
    }
  }

  return (
    <Link href={href} className={className} onClick={onClick} scroll={false}>
      {children}
    </Link>
  );
}
