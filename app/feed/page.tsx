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
import { Textarea } from "@/components/ui/textarea";

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
              <div className="p-6">
                {/* Actions Row */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLike(post.id)}
                      className={`hover:bg-red-50 transition-colors ${
                        post.likes.some((l) => l.userId === session?.user?.id)
                          ? "text-red-500 hover:text-red-600"
                          : "hover:text-red-500"
                      }`}
                    >
                      <Heart
                        className={`h-6 w-6 transition-colors ${
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
                      className="hover:bg-blue-50 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="h-6 w-6" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="hover:bg-yellow-50 hover:text-yellow-500 transition-colors"
                  >
                    <Bookmark className="h-6 w-6" />
                  </Button>
                </div>

                {/* Likes Count */}
                {post.likes.length > 0 && (
                  <p className="font-semibold text-sm mb-3">
                    {post.likes.length} {post.likes.length === 1 ? "like" : "likes"}
                  </p>
                )}

                {/* Caption */}
                {post.caption && (
                  <div className="mb-4">
                    <p className="text-sm leading-relaxed">
                      <span className="font-semibold mr-2">{post.pet.name}</span>
                      {post.caption}
                    </p>
                  </div>
                )}

                {/* Comments Preview */}
                {post.comments.length > 0 && (
                  <div className="space-y-3">
                    {post.comments.slice(0, 2).map((comment) => (
                      <div key={comment.id} className="flex items-start gap-2">
                        <p className="text-sm leading-relaxed">
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
                        className="text-muted-foreground hover:text-foreground p-0 h-auto text-sm font-medium"
                        onClick={() => setSelectedPost(selectedPost === post.id ? null : post.id)}
                      >
                        View all {post.comments.length} comments
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedPost(null)}
        >
          <Card 
            className="w-full h-[90vh] sm:max-w-5xl p-0 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <CardContent className="p-0 h-full">
              <div className="grid grid-rows-[1fr_auto] md:grid-cols-2 md:grid-rows-1 h-full">
                {/* Image Section */}
                <div className="relative bg-black h-[50vh] md:h-full">
                  <img
                    src={posts.find(p => p.id === selectedPost)?.image}
                    alt="Post"
                    className="object-contain w-full h-full"
                  />
                </div>

                {/* Content Section */}
                <div className="flex flex-col h-[40vh] md:h-full overflow-y-auto">
                  {/* Pet Info and Caption Section */}
                  <div className="p-4 sm:p-8 border-b">
                    <div className="space-y-4 sm:space-y-6">
                      {/* Pet Profile */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 cursor-pointer" onClick={() => router.push(`/pets/${posts.find(p => p.id === selectedPost)?.pet.id}/social`)}>
                          <AvatarImage
                            src={posts.find(p => p.id === selectedPost)?.pet.image || ""}
                            alt={posts.find(p => p.id === selectedPost)?.pet.name || ""}
                          />
                          <AvatarFallback>
                            {posts.find(p => p.id === selectedPost)?.pet.name?.[0] || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h2 className="text-lg sm:text-xl font-semibold cursor-pointer hover:underline" onClick={() => router.push(`/pets/${posts.find(p => p.id === selectedPost)?.pet.id}/social`)}>
                            {posts.find(p => p.id === selectedPost)?.pet.name}
                          </h2>
                          <p className="text-sm sm:text-base text-muted-foreground">
                            {formatDistanceToNow(new Date(posts.find(p => p.id === selectedPost)?.createdAt || ""), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Caption */}
                      {posts.find(p => p.id === selectedPost)?.caption && (
                        <div className="space-y-2">
                          <p className="text-sm sm:text-base leading-relaxed">
                            {posts.find(p => p.id === selectedPost)?.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comments Section */}
                  <div className="flex-1">
                    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                      {posts.find(p => p.id === selectedPost)?.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3 sm:gap-4">
                          <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                            <AvatarImage
                              src={comment.user.image || ""}
                              alt={comment.user.name || ""}
                            />
                            <AvatarFallback>
                              {comment.user.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm sm:text-base font-semibold">
                                {comment.user.name}
                              </p>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                            <p className="text-sm sm:text-base leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comment Form Section */}
                  <div className="p-4 sm:p-8 border-t bg-muted/50">
                    {/* Like and Comment Count */}
                    <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleLike(selectedPost)}
                          className={`hover:bg-red-50 transition-colors ${
                            posts.find(p => p.id === selectedPost)?.likes.some(l => l.userId === session?.user?.id)
                              ? "text-red-500 hover:text-red-600"
                              : "hover:text-red-500"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors ${
                              posts.find(p => p.id === selectedPost)?.likes.some(l => l.userId === session?.user?.id)
                                ? "fill-red-500 text-red-500"
                                : ""
                            }`}
                          />
                        </Button>
                        <span>{posts.find(p => p.id === selectedPost)?.likes.length || 0} likes</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2">
                        <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>{posts.find(p => p.id === selectedPost)?.comments.length || 0} comments</span>
                      </div>
                    </div>

                    {/* Comment Input */}
                    {session?.user && (
                      <div className="flex gap-2 sm:gap-3">
                        <Textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 resize-none min-h-[60px] sm:min-h-[80px]"
                          rows={2}
                        />
                        <Button
                          onClick={() => handleComment(selectedPost)}
                          disabled={!newComment.trim()}
                          className="shrink-0 self-end"
                          size="sm"
                        >
                          <Send className="h-4 w-4 sm:h-5 sm:w-5" />
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