import getSongs from "@/actions/getSongs";
import Header from "@/components/Header";
import ListItem from "@/components/ListItem";
import { createServerSupabaseClient } from "@/utils/supabase/server";

import PageContent from "./components/PageContent";
import AuthLanding from "./components/AuthLanding";

export const revalidate = 0;

export default async function Home() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <AuthLanding />;
  }

  const songs = await getSongs();

  return (
    <div
      className="
        bg-neutral-900
        rounded-lg
        h-full
        w-full
        overflow-hidden
        overflow-y-auto
      "
    >
      <Header>
        <div className="mb-2">
          <h1
            className="
              text-white
              text-3xl
              font-semibold
            "
          >
            Találj rá kedvenceidre!
          </h1>

          <div
            className="
              mt-4
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-2
              xl:grid-cols-3
            "
          >
            <ListItem
              image="/images/liked_.png"
              name="Kedvelt dalok"
              href="liked"
            />
          </div>
        </div>
      </Header>

      <div className="mt-2 mb-7 px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-white">Legújabb zenék</h1>
        </div>

        <PageContent songs={songs} />
      </div>
    </div>
  );
}
