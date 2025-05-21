"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from "lucide-react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/feed");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-8">
          <PawPrint className="h-16 w-16 text-blue-500" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Welcome to Pet Connect</h1>
        <p className="text-xl text-gray-600 mb-8">
          Connect with pets and their owners in your community
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => router.push("/login")}
            className="bg-blue-500 hover:bg-blue-600"
          >
            Sign In
          </Button>
          <Button
            onClick={() => router.push("/register")}
            variant="outline"
          >
            Create Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
        <Card>
          <CardHeader>
            <CardTitle>Find Pets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Discover pets in your area and connect with their owners
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Share Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Share photos and updates about your pets with the community
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Stay Connected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Follow your favorite pets and get notified about their activities
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
