import type { ReactNode } from "react";

interface CodeProps {
  children?: ReactNode;
}

export const Code = (props: CodeProps) => {
  return (
    <div
      className="shiki mb-2 whitespace-pre-wrap w-full overflow-x-auto -my-0.5 inline-block rounded-md bg-zinc-50 p-4 dark:bg-shiki-dark"
    >
      {props.children}
    </div>
  );
}
