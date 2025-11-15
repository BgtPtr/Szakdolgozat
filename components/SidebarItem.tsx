"use client";

import Link from "next/link";
import { IconType } from "react-icons";
import { twMerge } from "tailwind-merge";

interface SidebarItemProps {
  icon?: IconType;
  label: string;
  active?: boolean;
  href: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon: Icon,
  label,
  active = false,
  href,
}) => {
  return (
    <Link
      href={href}
      className={twMerge(
        `
        flex items-center w-full gap-4
        text-base font-medium
        cursor-pointer transition
        text-neutral-400 hover:text-white
        py-1
        `,
        active && 'text-white'
      )}
    >
      {Icon ? <Icon className="size-7" aria-hidden /> : null}
      <span>{label}</span>
    </Link>
  );
};

export default SidebarItem;
