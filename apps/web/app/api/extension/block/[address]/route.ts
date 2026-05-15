import { NextResponse } from "next/server";
import { toggleBlock, isBlocked } from "@/lib/server/user-state";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const result = toggleBlock(address);
  return NextResponse.json({ ok: true, ...result, address });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  return NextResponse.json({ address, blocked: isBlocked(address) });
}
