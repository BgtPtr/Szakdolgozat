"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

interface ModalProps {
  isOpen: boolean;
  onChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onChange,
  title,
  description,
  children,
}) => {
  return (
    <Dialog.Root open={isOpen} onOpenChange={onChange}>
      <Dialog.Portal>
        {/* Háttér – fade in/out */}
        <Dialog.Overlay
          className="
            fixed
            inset-0
            z-40
            bg-neutral-900/80
            backdrop-blur-sm
            data-[state=open]:opacity-100
            data-[state=closed]:opacity-0
            transition-opacity
            duration-200
          "
        />

        {/* Tartalom – kicsi zoom + fade */}
        <Dialog.Content
          className="
            fixed
            z-50
            top-1/2
            left-1/2
            translate-x-[-50%]
            translate-y-[-50%]
            w-full
            md:w-[90vw]
            md:max-w-[450px]
            max-h-[85vh]
            rounded-md
            border
            border-neutral-700
            bg-neutral-800
            p-[25px]
            shadow-xl
            data-[state=open]:opacity-100
            data-[state=open]:scale-100
            data-[state=closed]:opacity-0
            data-[state=closed]:scale-95
            transition-all
            duration-200
            focus:outline-none
          "
        >
          <Dialog.Title
            className="
              text-xl
              text-center
              font-bold
              mb-4
              text-white
            "
          >
            {title}
          </Dialog.Title>

          <Dialog.Description
            className="
              mb-5
              text-sm
              leading-normal
              text-center
              text-neutral-300
            "
          >
            {description}
          </Dialog.Description>

          <div>{children}</div>

          <Dialog.Close asChild>
            <button
              className="
                text-neutral-400
                hover:text-white
                absolute
                top-[10px]
                right-[10px]
                inline-flex
                h-[25px]
                w-[25px]
                items-center
                justify-center
                rounded-full
                transition-colors
              "
            >
              <IoMdClose />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
