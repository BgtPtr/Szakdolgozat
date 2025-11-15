import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        className={twMerge(
          `flex
          w-full
          rounded-md
          border
          border-neutral-700
          bg-neutral-800
          px-3
          py-2
          text-sm
          file:border-0
          file:bg-transparent
          file:text-sm
          file:font-medium
          placeholder:text-neutral-400
          focus:outline-none
          focus:ring-1`,
          className
        )}
        disabled={disabled}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;
