import { NextRequest, NextResponse } from "next/server";

export async function login(req: NextRequest): Promise<NextResponse>  {
    return NextResponse.json({},{status:200})
}