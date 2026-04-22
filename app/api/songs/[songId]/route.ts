import { NextResponse } from "next/server";
import { deleteSongCompletely } from "@/actions/deleteSongCompletely";

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ songId: string }> }
) {
    try {
        const { songId } = await params;

        if (!songId) {
            return NextResponse.json(
                { error: "Hiányzó songId." },
                { status: 400 }
            );
        }

        await deleteSongCompletely(songId);

        return NextResponse.json({ success: true });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Sikertelen törlés.";

        return NextResponse.json({ error: message }, { status: 400 });
    }
}