"use client";

import { FaLock } from "react-icons/fa";

import Button from "@/components/Button";
import useAuthModal from "@/hooks/useAuthModal";

const AuthLanding = () => {
    const { openSignIn, openSignUp } = useAuthModal();

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
            <section
                className="
                    relative
                    isolate
                    flex
                    min-h-full
                    flex-col
                    justify-start
                    overflow-hidden
                    bg-gradient-to-b
                    from-[#d6d31a]
                    via-[#d6d31a]/80
                    to-neutral-900
                    px-6
                    pt-16
                    pb-10
                    sm:px-10
                    sm:pt-20
                    sm:pb-12
                    lg:px-14
                    lg:pt-24
                    lg:pb-12
                "
            >

                <div className="pointer-events-none absolute inset-0 opacity-30">
                    <div className="absolute -left-16 top-8 h-44 w-44 rounded-full bg-black/20 blur-3xl" />
                    <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-yellow-100/10 blur-3xl" />
                </div>

                <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-2xl">
                        <div className="mb-6 flex items-center gap-4">
                            <div
                                className="
                                    flex
                                    h-14
                                    w-14
                                    items-center
                                    justify-center
                                    rounded-2xl
                                    bg-black/25
                                    backdrop-blur-md
                                    shadow-[0_0_20px_rgba(0,0,0,0.4)]
                                "
                            >
                                <span
                                    className="
                                        text-2xl
                                        font-black
                                        tracking-tight
                                        bg-gradient-to-br
                                        from-black
                                        via-neutral-900
                                        to-neutral-700
                                        bg-clip-text
                                        text-transparent
                                "
                                >
                                    P
                                </span>
                            </div>

                            <div>
                                <p className="text-sm font-medium uppercase tracking-[0.3em] text-black/80">
                                    Petify
                                </p>
                                <p className="text-sm text-black/70">zene. füleidnek.</p>
                            </div>
                        </div>

                        <h1
                            className="
                                text-4xl
                                font-black
                                tracking-tight
                                text-black
                                sm:text-5xl
                                lg:text-6xl
                            "
                        >
                            Hallgasd kedvenceidet,
                            <span className="block text-white drop-shadow-[0_0_18px_rgba(0,0,0,0.45)]">
                                de előbb lépj be.
                            </span>
                        </h1>
                    </div>

                    <div
                        className="
                            flex
                            w-full
                            max-w-md
                            flex-col
                            rounded-3xl
                            border
                            border-white/10
                            bg-black/45
                            p-7
                            lg:mt-10
                            shadow-[0_20px_60px_rgba(0,0,0,0.45)]
                            backdrop-blur-md
                        "
                    >
                        <div className="mb-8 flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white">
                                <FaLock size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                                    Belépés szükséges
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
                            <Button
                                onClick={openSignIn}
                                className="
                                    w-full
                                    bg-white
                                    py-4
                                    text-sm
                                    font-bold
                                    text-black
                                    hover:opacity-90
                                "

                            >
                                Bejelentkezés
                            </Button>

                            <Button
                                onClick={openSignUp}
                                className="
                                    w-full
                                    border-white/20
                                    bg-white/10
                                    py-4
                                    text-sm
                                    font-bold
                                    text-white
                                    backdrop-blur-sm
                                    hover:bg-white/15
                                "
                            >
                                Regisztráció
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
};

export default AuthLanding;
