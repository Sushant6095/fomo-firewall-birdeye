import { NextResponse } from "next/server";
import { removeWatch } from "@/lib/server/user-state";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const result = removeWatch(address);
  return NextResponse.json({ ok: true, ...result, address });
}
