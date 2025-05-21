"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Pet = {
  id: string;
  name: string;
  type: string;
  description?: string;
  qrCode: string;
  image?: string;
};

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPet, setNewPet] = useState({ name: "", type: "", description: "", image: "" });
  const router = useRouter();

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

  async function handleAddPet(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPet),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPets([...pets, data.pet]);
      setIsDialogOpen(false);
      setNewPet({ name: "", type: "", description: "", image: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add pet");
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Pets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Pet</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPet} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={newPet.type}
                  onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newPet.description}
                  onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  type="url"
                  value={newPet.image}
                  onChange={(e) => setNewPet({ ...newPet, image: e.target.value })}
                  placeholder="https://example.com/pet-image.jpg"
                />
              </div>
              <Button type="submit">Add Pet</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <Card key={pet.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/pets/${pet.id}`)}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={pet.image} alt={pet.name} />
                <AvatarFallback>{pet.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle>{pet.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Type: {pet.type}</p>
              {pet.description && (
                <p className="mt-2 text-sm">{pet.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 