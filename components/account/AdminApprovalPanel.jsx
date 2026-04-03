"use client";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/Auth";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Calendar,
  Folder,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

const AdminApprovalPanel = () => {
  const { getAuthHeaders, user, hasRole } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);

  // Check if user is admin
  if (!hasRole("administrator") && !hasRole("editor")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You need admin privileges to access this page.
          </p>
          <Link
            to={`/`}
            className="bg-blue-500 text-white px-32 font-bold text-2xl py-2 rounded-xl hover:bg-blue-600 transition-colors duration-300"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://purple-weasel-386695.hostingersite.com/wp-json/bloghub/v1/posts/pending",
        { headers: getAuthHeaders() },
      );

      setPosts(response.data.posts);
    } catch (error) {
      console.error("Failed to fetch pending posts:", error);
      toast.error("Failed to load pending posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const handleApprove = async (postId) => {
    try {
      setApproving(true);

      const response = await axios.put(
        `https://purple-weasel-386695.hostingersite.com/wp-json/bloghub/v1/posts/approve/${postId}`,
        {},
        { headers: getAuthHeaders() },
      );

      toast.success(response.data.message);
      fetchPendingPosts();
    } catch (error) {
      console.error("Failed to approve post:", error);
      toast.error(error.response?.data?.message || "Failed to approve post");
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPost) return;

    try {
      setRejecting(true);

      const response = await axios.put(
        `https://purple-weasel-386695.hostingersite.com/wp-json/bloghub/v1/posts/reject/${selectedPost.id}`,
        { reason: rejectReason },
        { headers: getAuthHeaders() },
      );

      toast.success(response.data.message);
      setSelectedPost(null);
      setRejectReason("");
      fetchPendingPosts();
    } catch (error) {
      console.error("Failed to reject post:", error);
      toast.error(error.response?.data?.message || "Failed to reject post");
    } finally {
      setRejecting(false);
    }
  };

  const openRejectModal = (post) => {
    setSelectedPost(post);
    setRejectReason("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Approval Panel
              </h1>
              <p className="text-gray-600 mt-2">
                Review and approve pending blog posts
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchPendingPosts}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>

              <div className="px-4 py-2 bg-purple-100 text-purple-800 rounded-xl font-medium">
                {posts.length} Pending
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {posts.length}
            </div>
            <div className="text-sm text-gray-500">Posts Awaiting Review</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {new Set(posts.map((p) => p.author.id)).size}
            </div>
            <div className="text-sm text-gray-500">Unique Authors</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {posts.reduce(
                (acc, post) => acc + (post.categories?.length || 0),
                0,
              )}
            </div>
            <div className="text-sm text-gray-500">Total Categories</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="text-3xl font-bold text-gray-800 mb-2">
              {user?.name}
            </div>
            <div className="text-sm text-gray-500">Reviewing As</div>
          </div>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading pending posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              No pending posts to review at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Post Preview */}
                    <div className="lg:w-2/3">
                      <div className="flex items-center space-x-2 mb-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                          ⏳ Awaiting Approval
                        </span>
                        <span className="text-sm text-gray-500">
                          Submitted {new Date(post.date).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {post.title}
                      </h3>

                      <div
                        className="prose max-w-none mb-4"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />

                      <div className="flex flex-wrap gap-3 mt-4">
                        {post.categories?.map((category) => (
                          <span
                            key={category}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Approval Actions */}
                    <div className="lg:w-1/3">
                      <div className="bg-gray-50 rounded-xl p-5 space-y-4">
                        {/* Author Info */}
                        <div className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <User className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {post.author.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              @{post.author.username}
                            </p>
                          </div>
                        </div>

                        {/* Post Info */}
                        <div className="space-y-2 p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {new Date(post.date).toLocaleString()}
                            </span>
                          </div>
                          {post.featured_image && (
                            <div className="mt-3">
                              <img
                                src={post.featured_image}
                                alt="Featured"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <button
                            onClick={() =>
                              window.open(`/?p=${post.id}`, "_blank")
                            }
                            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>Preview Post</span>
                          </button>

                          <div className="grid grid-cols-2 gap-3">
                            <button
                              onClick={() => handleApprove(post.id)}
                              disabled={approving}
                              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>
                                {approving ? "Approving..." : "Approve"}
                              </span>
                            </button>

                            <button
                              onClick={() => openRejectModal(post)}
                              className="flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all"
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Reject Post
            </h3>
            <p className="text-gray-600 mb-2">
              Rejecting: <strong>{selectedPost.title}</strong>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for rejection (optional)
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows="3"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Provide feedback to help the author improve..."
              />
              <p className="text-sm text-gray-500 mt-1">
                This will be sent to the author via email.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                disabled={rejecting}
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all disabled:opacity-50"
              >
                {rejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminApprovalPanel;
