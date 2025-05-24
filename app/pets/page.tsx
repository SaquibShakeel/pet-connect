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
import { ImagePlus } from "lucide-react";

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
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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
      setUploading(true);
      setError("");

      let imageUrl = newPet.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", "pet_connect");

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/dp0ujlbby/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("Failed to upload image");
        }

        const { secure_url } = await uploadRes.json();
        imageUrl = secure_url;
      }

      const res = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPet, image: imageUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPets([...pets, data.pet]);
      setIsDialogOpen(false);
      setNewPet({ name: "", type: "", description: "", image: "" });
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add pet");
    } finally {
      setUploading(false);
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">My Pets</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add Pet
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Add New Pet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPet} className="space-y-6 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                <Input
                  id="name"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">Type</Label>
                <Input
                  id="type"
                  value={newPet.type}
                  onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="description"
                  value={newPet.description}
                  onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium">Pet Image</Label>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image")?.click()}
                      className="w-full"
                    >
                      <ImagePlus className="h-4 w-4 mr-2" />
                      {imageFile ? "Change Image" : "Select Image"}
                    </Button>
                  </div>
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full mt-6 bg-primary hover:bg-primary/90"
                disabled={uploading}
              >
                {uploading ? "Adding Pet..." : "Add Pet"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center p-4 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400">
          Error: {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card 
              key={pet.id} 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 dark:bg-gray-900 dark:border-gray-800 group"
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
          ))}
        </div>
      )}
    </div>
  );
}