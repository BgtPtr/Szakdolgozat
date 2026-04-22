import { redirect } from "next/navigation";

import Header from "@/components/Header";
import Box from "@/components/Box";
import getSongsByUserId from "@/actions/getSongsByUserId";
import { createServerSupabaseClient } from "@/utils/supabase/server";
import PageContent from "@/app/(site)/components/PageContent";

const AccountPage = async () => {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/");
  }

  const userSongs = await getSongsByUserId();

  return (
    <div className="bg-neutral-900 rounded-lg h-full w-full overflow-hidden overflow-y-auto">
      <Header>
        <div className="px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-bold">
              Fiókom
            </h1>

            <div className="rounded-md bg-neutral-900/40 px-5 py-4 md:min-w-[360px]">
              <p className="text-neutral-400 text-sm mb-1">
                Bejelentkezve ezzel az e-mail címmel:
              </p>

              <p className="text-white text-lg font-semibold break-all">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </Header>

      <div className="px-6 pb-10 flex flex-col gap-y-6">
        <Box className="p-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-white text-xl font-semibold">
                Saját feltöltéseim
              </h2>
              <p className="text-neutral-400 text-sm mt-1">
                Itt kezelheted a saját feltöltött zenéidet.
              </p>
            </div>

            <div className="text-sm text-neutral-400">
              Összesen:{" "}
              <span className="text-white font-semibold">
                {userSongs.length}
              </span>{" "}
              db
            </div>
          </div>

          <PageContent songs={userSongs} />
        </Box>
      </div>
    </div>
  );
};

export default AccountPage;