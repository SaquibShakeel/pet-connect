"use client";

import { useState, useEffect } from "react";
import { PetCard } from "./pet-card";
import { AddPetDialog } from "./add-pet-dialog";

type Pet = {
  id: string;
  name: string;
  type: string;
  description?: string;
  image?: string;
};

export function PetsListContainer() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPets();
  }, []);

  async function fetchPets() {
    try {
      const res = await fetch("/api/pets");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPets(data.pets);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pets");
    } finally {
      setLoading(false);
    }
  }

  const handleAddPet = async (newPet: Omit<Pet, "id">) => {
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPets([...pets, data.pet]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add pet");
      throw err;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <>
      <div className="flex justify-end mb-8">
        <AddPetDialog
          onAddPet={handleAddPet}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </>
  );
} 