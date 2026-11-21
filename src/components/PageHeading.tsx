import type { ReactNode } from "react";
export default function PageHeading({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return <div className="page-heading" data-enter><div><h1>{title}</h1><p>{children}</p></div>{aside && <div className="heading-aside">{aside}</div>}</div>;
}
