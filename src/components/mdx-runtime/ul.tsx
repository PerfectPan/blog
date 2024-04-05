import type { ReactNode } from "react";

interface OrderedListProps {
  children?: ReactNode;
}

export const OrderedList = (props: OrderedListProps) => {
  return (
    <ul
      className="mb-4 ml-4 list-disc"
    >
      {props.children}
    </ul>
  )
}
