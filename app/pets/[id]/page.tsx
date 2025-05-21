"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Pet = {
  id: string;
  name: string;
  type: string;
  description?: string;
  qrCode: string;
  image?: string;
  locations: Location[];
  feeds: Feed[];
};

type Location = {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
};

type Feed = {
  id: string;
  timestamp: string;
  notes?: string;
};

export default function PetPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedNote, setFeedNote] = useState("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedPet, setEditedPet] = useState<Partial<Pet>>({});

  useEffect(() => {
    fetchPet();
  }, [id]);

  async function fetchPet() {
    try {
      const res = await fetch(`/api/pets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setEditedPet(data.pet);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pet");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFeed(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pets/${id}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: feedNote }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setFeedNote("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add feed");
    }
  }

  async function handleUpdatePet(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedPet),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPet(data.pet);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update pet");
    }
  }

  async function handleDeletePet() {
    try {
      const res = await fetch(`/api/pets/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete pet");
      router.push("/pets");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete pet");
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Pet not found</h2>
          <p className="mt-2 text-gray-600">The pet you're looking for doesn't exist or has been removed.</p>
          <Button className="mt-4" onClick={() => router.push("/pets")}>
            Back to Pets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  {pet.image ? (
                    <AvatarImage 
                      src={pet.image} 
                      alt={pet.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="text-lg bg-primary/10">
                      {pet.name.charAt(0)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <CardTitle>{pet.name}</CardTitle>
                  <p className="text-sm text-gray-500">Type: {pet.type}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/pets/${id}/social`)}
                >
                  View Social Feed
                </Button>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">Edit</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Edit Pet</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdatePet} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={editedPet.name || ""}
                          onChange={(e) => setEditedPet({ ...editedPet, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Input
                          id="type"
                          value={editedPet.type || ""}
                          onChange={(e) => setEditedPet({ ...editedPet, type: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editedPet.description || ""}
                          onChange={(e) => setEditedPet({ ...editedPet, description: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="image">Image URL</Label>
                        <Input
                          id="image"
                          type="url"
                          value={editedPet.image || ""}
                          onChange={(e) => setEditedPet({ ...editedPet, image: e.target.value })}
                          placeholder="https://example.com/pet-image.jpg"
                        />
                      </div>
                      <Button type="submit">Save Changes</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete {pet.name}'s data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeletePet}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardHeader>
            <CardContent>
              {pet.description && (
                <p className="mt-2">{pet.description}</p>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>QR Code</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <QRCodeSVG value={`${window.location.origin}/scan/${pet.qrCode}`} size={200} />
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Add Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddFeed} className="space-y-4">
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={feedNote}
                    onChange={(e) => setFeedNote(e.target.value)}
                    placeholder="What did you feed?"
                  />
                </div>
                <Button type="submit">Add Feed</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Feed History</CardTitle>
            </CardHeader>
            <CardContent>
              {!pet.feeds || pet.feeds.length === 0 ? (
                <p>No feed history</p>
              ) : (
                <div className="space-y-4">
                  {pet.feeds.map((feed) => (
                    <div key={feed.id} className="border-b pb-2">
                      <p className="text-sm text-gray-500">
                        {new Date(feed.timestamp).toLocaleString()}
                      </p>
                      {feed.notes && <p className="mt-1">{feed.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Location History</CardTitle>
            </CardHeader>
            <CardContent>
              {!pet.locations || pet.locations.length === 0 ? (
                <p>No location history</p>
              ) : (
                <div className="space-y-4">
                  {pet.locations.map((location) => (
                    <div key={location.id} className="border-b pb-2">
                      <p className="text-sm text-gray-500">
                        {new Date(location.timestamp).toLocaleString()}
                      </p>
                      <p className="mt-1">
                        Lat: {location.latitude}, Long: {location.longitude}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 