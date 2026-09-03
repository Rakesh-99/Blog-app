import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { ImWarning } from "react-icons/im";
import { IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import BlogLoader from "../assests/blogSpinner/BlogLoader";

const truncateId = (id) => (id ? `${id.slice(0, 6)}...${id.slice(-4)}` : "—");

const AllComments = () => {
  const { user } = useSelector((state) => state.userSliceApp);
  const { theme } = useSelector((state) => state.themeSliceApp);
  const isDark = theme === "dark";

  const [loader, setLoader] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [getAllComments, setAllComments] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [commentIdToDelete, setCommentIdToDelete] = useState("");
  const [startPage, setStartPage] = useState(1);

  useEffect(() => {
    if (user?.isAdmin) {
      const getComments = async () => {
        setLoader(true);
        try {
          const commentInfo = await axios.get(`/api/comment/get-all-comments`, {
            headers: { Authorization: user.token },
          });
          const response = commentInfo.data.comments;
          setAllComments(response);
          setShowMoreButton(response.length > 4);
        } catch (error) {
          console.log(error.message);
        } finally {
          setLoader(false);
        }
      };
      getComments();
    }
  }, [user?._id]);

  const deleteUserHandle = (id) => {
    setShowModal(true);
    setCommentIdToDelete(id);
  };

  const cancelHandle = () => {
    setShowModal(false);
  };

  const showMoreCommentButton = async () => {
    setLoadingMore(true);
    try {
      const response = await axios.get(
        `/api/comment/get-all-comments?page=${startPage + 1}`,
        { headers: { Authorization: user.token } }
      );

      if (response.status === 200) {
        const newComments = response.data.comments;

        if (newComments.length === 0) {
          setShowMoreButton(false);
          toast.success("All comments have been fetched");
        } else {
          setStartPage((prev) => prev + 1);
          setAllComments((prev) => [...prev, ...newComments]);
        }
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const yesToDeleteComment = async () => {
    try {
      const response = await axios.delete(
        `/api/comment/delete-comment/${commentIdToDelete}`,
        {
          data: { user: user },
          headers: { Authorization: user.token },
        }
      );
      if (response.status === 200) {
        setAllComments((prev) =>
          prev.filter((c) => c._id !== commentIdToDelete)
        );
        toast.success("Comment has been deleted");
        setShowModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error.message);
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  const thClass = `text-left py-4 px-5 text-xs font-semibold uppercase tracking-wide ${
    isDark ? "text-gray-400 bg-zinc-800/60" : "text-gray-500 bg-gray-50"
  }`;

  return (
    <>
      <div className="w-full px-2 md:px-5 py-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[3px] text-indigo-400 mb-1">
            Admin
          </p>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-zinc-900"}`}>
            Manage Comments
          </h1>
        </div>

        <div
          className={`rounded-2xl border overflow-hidden ${
            isDark ? "border-zinc-800 bg-zinc-900" : "border-gray-200 bg-white"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thClass}>Updated</th>
                  <th className={thClass}>Comment</th>
                  <th className={`${thClass} text-center`}>Likes</th>
                  <th className={thClass}>Post ID</th>
                  <th className={thClass}>User ID</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody
                className={`divide-y ${isDark ? "divide-zinc-800" : "divide-gray-100"}`}
              >
                {loader ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <BlogLoader />
                    </td>
                  </tr>
                ) : getAllComments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
                        No comments yet
                      </p>
                    </td>
                  </tr>
                ) : (
                  getAllComments.map((comment) => (
                    <tr
                      key={comment._id}
                      className={`transition-colors ${
                        isDark ? "hover:bg-zinc-800/50" : "hover:bg-gray-50"
                      }`}
                    >
                      {/* Date */}
                      <td
                        className={`py-4 px-5 text-sm whitespace-nowrap ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {new Date(comment.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Comment text */}
                      <td className="py-4 px-5 max-w-xs">
                        <p
                          className={`text-sm line-clamp-2 ${
                            isDark ? "text-gray-200" : "text-gray-700"
                          }`}
                        >
                          {comment.comment}
                        </p>
                      </td>

                      {/* Likes */}
                      <td
                        className={`py-4 px-5 text-sm text-center ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {comment.likes?.length ?? 0}
                      </td>

                      {/* Post ID */}
                      <td
                        title={comment.blogId}
                        className={`py-4 px-5 text-xs font-mono ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {truncateId(comment.blogId)}
                      </td>

                      {/* User ID */}
                      <td
                        title={comment.userId}
                        className={`py-4 px-5 text-xs font-mono ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {truncateId(comment.userId)}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex justify-end">
                          <button
                            title="Delete"
                            onClick={() => deleteUserHandle(comment._id)}
                            className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                              isDark
                                ? "hover:bg-red-500/10 text-red-400"
                                : "hover:bg-red-50 text-red-500"
                            }`}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showMoreButton && (
            <div
              className={`text-center py-5 border-t ${
                isDark ? "border-zinc-800" : "border-gray-100"
              }`}
            >
              <button
                onClick={showMoreCommentButton}
                disabled={loadingMore}
                className={`text-sm font-semibold px-5 py-2 rounded-full border transition-colors disabled:opacity-50 ${
                  isDark
                    ? "border-zinc-700 hover:bg-zinc-800"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                {loadingMore ? "Loading..." : "Show more"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 flex justify-center items-center px-4">
          <div
            className={`flex flex-col gap-6 shadow-xl w-full max-w-sm rounded-2xl px-6 py-6 ${
              isDark ? "bg-zinc-800 text-gray-200" : "bg-white text-gray-900"
            }`}
          >
            <button
              className="self-end opacity-60 hover:opacity-100 transition-opacity"
              onClick={cancelHandle}
            >
              <IoClose size={22} />
            </button>

            <div className="flex flex-col items-center gap-3 -mt-4">
              <div
                className={`p-3 rounded-full ${
                  isDark ? "bg-red-500/10" : "bg-red-50"
                }`}
              >
                <ImWarning size={28} className="text-red-500" />
              </div>
              <p className="text-base text-center font-medium">
                Are you sure you want to delete this comment?
              </p>
              <p className="text-sm text-center opacity-60">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 text-sm rounded-lg transition-all active:scale-95 font-semibold py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white"
                onClick={yesToDeleteComment}
              >
                Yes, delete
              </button>
              <button
                className={`flex-1 border text-sm font-semibold active:scale-95 transition-all rounded-lg py-2.5 px-4 ${
                  isDark
                    ? "border-zinc-600 hover:bg-zinc-700"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
                onClick={cancelHandle}
              >
                No, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster />
    </>
  );
};

export default AllComments;