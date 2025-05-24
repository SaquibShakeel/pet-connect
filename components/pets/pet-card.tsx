"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Pet = {
  id: string;
  name: string;
  type: string;
  description?: string;
  image?: string;
};

interface PetCardProps {
  pet: Pet;
  className?: string;
}

export function PetCard({ pet, className = "" }: PetCardProps) {
  const router = useRouter();

  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800 group ${className}`}
      onClick={() => router.push(`/pets/${pet.id}`)}
    >
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16 transition-transform group-hover:scale-110">
          <AvatarImage src={pet.image} alt={pet.name} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary">{pet.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">{pet.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 dark:text-gray-400">Type: {pet.type}</p>
        {pet.description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{pet.description}</p>
        )}
      </CardContent>
    </Card>
  );
} 