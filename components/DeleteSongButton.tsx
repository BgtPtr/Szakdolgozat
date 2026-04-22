"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

interface DeleteSongButtonProps {
    songId: string;
    className?: string;
}

const DeleteSongButton: React.FC<DeleteSongButtonProps> = ({
    songId,
    className = "",
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleDelete = async (
        e: React.MouseEvent<HTMLButtonElement>
    ) => {
        e.preventDefault();
        e.stopPropagation();

        const confirmed = window.confirm(
            "Biztosan törölni szeretnéd ezt a dalt?"
        );

        if (!confirmed) return;

        try {
            setIsLoading(true);

            const response = await fetch(`/api/songs/${songId}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result?.error || "Sikertelen törlés.");
            }

            toast.success("A dal sikeresen törölve.");
            router.refresh();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Sikertelen törlés.";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isLoading}
            className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-red-600/90
                text-white
                shadow-md
                transition
                hover:bg-red-700
                disabled:cursor-not-allowed
                disabled:opacity-60
                ${className}
        `}
            title="Dal törlése"
        >
            <FiTrash2 size={16} />
        </button>
    );
};

export default DeleteSongButton;