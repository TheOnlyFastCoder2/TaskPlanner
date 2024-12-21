import { PropsWithChildren } from "react";

interface IPropsPopOver extends PropsWithChildren {
  isOpen: boolean,
}

export const Popover = ({ isOpen, children }: IPropsPopOver) => {
  if (!isOpen) return null;
  return (children);
};
