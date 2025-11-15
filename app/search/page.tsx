import getSongsByTitle from "@/actions/getSongsByTitle";
import Header from "@/components/Header";
import SearchInput from "@/components/SearchInput";
import SearchContent from "./components/SearchContent";

interface SearchProps {
  searchParams: Promise<{
    title?: string | string[];
  }>;
}

const Search = async ({ searchParams }: SearchProps) => {

  const params = await searchParams;
  const titleParam = typeof params?.title === "string" ? params.title : "";
  const songs = await getSongsByTitle(titleParam);

  return (
    <div
    className="
    bg-neutral-900
    rounded-lg
    h-full
    w-full
    overflow-hidden
    overflow-y-auto    
    ">
      <Header className="from-bg-neutral-900">
        <div className="mb-2 flex flex-col gap-y-6">
          <h1 className="text-white text-3xl font-semibold">
            Keresés
          </h1>
          <SearchInput/>
        </div>
      </Header>
      <SearchContent songs={songs}/>
    </div>
  );
};

export default Search;
