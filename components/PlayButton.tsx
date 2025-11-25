import { FaPlay } from "react-icons/fa";

const PlayButton = () => {
  return (
    <button
      className="
        opacity-0
        group-hover:opacity-100
        transition
        rounded-full
        flex
        items-center
        justify-center
        bg-green-500
        w-10
        h-10
        drop-shadow-md
        translate-y-1/4
        group-hover:translate-y-0
        hover:scale-105
      "
    >
      <FaPlay className="text-black w-4 h-4 ml-[1px]" />
    </button>
  );
};

export default PlayButton;
