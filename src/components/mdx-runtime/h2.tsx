import type { ReactNode } from "react";

interface H2Props {
  children?: ReactNode;
}

export const H2 = (props: H2Props) => {
  return (
    <h2
      className="mb-6 mt-14 text-balance font-black text-2xl leading-none first:mt-0 f"
    >
      {props.children}
    </h2>
  );
}