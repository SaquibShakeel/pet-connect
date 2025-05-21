import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

// POST /api/pets/[id]/feed - Add a feed record
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notes } = await req.json();
  const pet = await prisma.pet.update({
    where: { id: params.id },
    data: {
      feeds: {
        create: {
          notes,
        },
      },
    },
    include: {
      feeds: {
        orderBy: { timestamp: "desc" },
        take: 10,
      },
    },
  });

  return NextResponse.json({ pet });
} 