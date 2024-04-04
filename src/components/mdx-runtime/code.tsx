import type { ReactNode } from "react";

interface CodeProps {
  children?: ReactNode;
}

export const Code = (props: CodeProps) => {
  return (
    <span
      className="-my-0.5 inline-block rounded bg-gray-900 px-1.5 py-px font-mono text-[13px] text-white/80 sm:text-base"
    >
      {props.children}
    </span>
  );
}
