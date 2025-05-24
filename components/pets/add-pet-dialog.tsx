"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImagePlus } from "lucide-react";

type Pet = {
  name: string;
  type: string;
  description: string;
  image: string;
};

interface AddPetDialogProps {
  onAddPet: (pet: Pet) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPetDialog({ onAddPet, isOpen, onOpenChange }: AddPetDialogProps) {
  const [newPet, setNewPet] = useState<Pet>({ name: "", type: "", description: "", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);

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

      await onAddPet({ ...newPet, image: imageUrl });
      
      // Reset form
      setNewPet({ name: "", type: "", description: "", image: "" });
      setImageFile(null);
      setImagePreview(null);
      onOpenChange(false);
    } catch (err) {
      console.error("Error adding pet:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
      <DialogContent className="w-[95vw] max-w-[425px] p-4 sm:p-6 dark:bg-gray-900 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-xl sm:text-2xl font-semibold text-center bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Add New Pet
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">Name</Label>
            <Input
              id="name"
              value={newPet.name}
              onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
              required
              className="w-full px-3 py-2 text-base sm:text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm font-medium">Type</Label>
            <Input
              id="type"
              value={newPet.type}
              onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
              required
              className="w-full px-3 py-2 text-base sm:text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={newPet.description}
              onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
              className="w-full px-3 py-2 text-base sm:text-sm border rounded-md dark:bg-gray-800 dark:border-gray-700 min-h-[100px]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image" className="text-sm font-medium">Pet Image</Label>
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
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
                  className="w-full text-base sm:text-sm py-2"
                >
                  <ImagePlus className="h-4 w-4 mr-2" />
                  {imageFile ? "Change Image" : "Select Image"}
                </Button>
              </div>
              {imagePreview && (
                <div className="relative w-full h-32 sm:h-48 rounded-lg overflow-hidden">
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
            className="w-full mt-4 sm:mt-6 bg-primary hover:bg-primary/90 text-base sm:text-sm py-2"
            disabled={uploading}
          >
            {uploading ? "Adding Pet..." : "Add Pet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
} 