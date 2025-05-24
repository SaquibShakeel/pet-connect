import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PetsListContainer } from "@/components/pets/pets-list-container";
import { PetsSkeleton } from "./pets-skeleton";
import { Suspense } from "react";

export default async function PetsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">My Pets</h1>
      </div>
      <Suspense fallback={<PetsSkeleton />}>
        <PetsListContainer />
      </Suspense>
    </div>
  );
}