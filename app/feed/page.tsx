"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  id: string;
  image: string;
  caption?: string;
  createdAt: string;
  pet: {
    id: string;
    name: string;
    image?: string;
  };
  likes: { userId: string }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    user: {
      name: string;
      image?: string;
    };
  }[];
}

export default function FeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newComment, setNewComment] = useState("");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchPosts();
    }
  }, [status, router]);

  async function fetchPosts() {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/feed");
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch feed");
      }
      const data = await res.json();
      setPosts(data.posts);
    } catch (err) {
      console.error("Error fetching feed:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch feed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLike(postId: string) {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      const isLiked = posts
        .find((p) => p.id === postId)
        ?.likes.some((l) => l.userId === session.user.id);

      const res = await fetch(`/api/posts/${postId}/likes`, {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update like");
      }

      // Update posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            const likes = isLiked
              ? post.likes.filter((l) => l.userId !== session.user.id)
              : [...post.likes, { userId: session.user.id }];
            return { ...post, likes };
          }
          return post;
        })
      );
    } catch (err) {
      console.error("Error updating like:", err);
      setError(err instanceof Error ? err.message : "Failed to update like");
    }
  }

  async function handleComment(postId: string) {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    if (!newComment.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add comment");
      }

      const { comment } = await res.json();

      // Update posts state
      setPosts((prevPosts) =>
        prevPosts.map((post) => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [comment, ...post.comments],
            };
          }
          return post;
        })
      );

      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError(err instanceof Error ? err.message : "Failed to add comment");
    }
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <div className="space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <div className="space-y-8">
        {posts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardContent className="p-0">
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 cursor-pointer" onClick={() => router.push(`/pets/${post.pet.id}/social`)}>
                    {post.pet.image ? (
                      <AvatarImage src={post.pet.image} alt={post.pet.name} />
                    ) : (
                      <AvatarFallback>{post.pet.name.charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-semibold cursor-pointer hover:underline" onClick={() => router.push(`/pets/${post.pet.id}/social`)}>
                      {post.pet.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>

              {/* Post Image */}
              <div className="relative aspect-square">
                <img
                  src={post.image}
                  alt="Post"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Post Actions */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLike(post.id)}
                      className={post.likes.some(
                        (l) => l.userId === session?.user?.id
                      ) ? "text-red-500" : ""}
                    >
                      <Heart
                        className={`h-6 w-6 ${
                          post.likes.some((l) => l.userId === session?.user?.id)
                            ? "fill-red-500 text-red-500"
                            : ""
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>

                {/* Likes Count */}
                {post.likes.length > 0 && (
                  <p className="font-semibold mb-2">
                    {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                  </p>
                )}

                {/* Caption */}
                {post.caption && (
                  <p className="mb-2">
                    <span className="font-semibold mr-2">{post.pet.name}</span>
                    {post.caption}
                  </p>
                )}

                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {post.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <p>
                          <span className="font-semibold mr-2">
                            {comment.user.name}
                          </span>
                          {comment.content}
                        </p>
                      </div>
                    ))}
                    {post.comments.length > 2 && (
                      <Button
                        variant="ghost"
                        className="text-gray-500 p-0 h-auto"
                        onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      >
                        View all {post.comments.length} comments
                      </Button>
                    )}
                  </div>
                )}

                {/* Comment Input */}
                {session?.user && (
                  <div className="flex gap-2 mt-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-transparent border-none focus:outline-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleComment(post.id)}
                      disabled={!newComment.trim()}
                    >
                      Post
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardContent className="p-0">
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-square">
                  <img
                    src={posts.find(p => p.id === selectedPost)?.image}
                    alt="Post"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {posts.find(p => p.id === selectedPost)?.caption && (
                      <p className="text-sm">{posts.find(p => p.id === selectedPost)?.caption}</p>
                    )}
                    <div className="space-y-2">
                      {posts.find(p => p.id === selectedPost)?.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={comment.user.image || ""}
                              alt={comment.user.name || ""}
                            />
                            <AvatarFallback>
                              {comment.user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {comment.user.name}
                            </p>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {session?.user && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 bg-transparent border-none focus:outline-none"
                        />
                        <Button
                          onClick={() => handleComment(selectedPost)}
                          disabled={!newComment.trim()}
                        >
                          Post
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 