import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import BlogPopupModal from "./BlogPopupModal";
import BlogLoader from "../assests/blogSpinner/BlogLoader";
import { PiSmileySad } from "react-icons/pi";
import { HiOutlinePencil, HiOutlineTrash, HiLockClosed } from "react-icons/hi2";

const AllBlogs = () => {
  const { user } = useSelector((state) => state.userSliceApp);
  const { theme } = useSelector((state) => state.themeSliceApp);
  const isDark = theme === "dark";

  const [userBlogs, setUserBlogs] = useState([]);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [blogModal, setBlogModal] = useState(false);
  const [blogId, setBlogId] = useState("");
  const [loader, setLoader] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(2);

  useEffect(() => {
    if (user?.isAdmin) {
      const getBlogs = async () => {
        setLoader(true);
        try {
          const fetchBlogs = await axios.get(
            `/api/blog/get-all-blogs?userId=${user._id}`
          );

          if (fetchBlogs.status === 200) {
            setUserBlogs(fetchBlogs.data.blogs);
            setShowMoreButton(fetchBlogs.data.blogs?.length > 5);
          }
        } catch (error) {
          toast.error("An unexpected error occurred!");
          console.log(error);
        } finally {
          setLoader(false);
        }
      };
      getBlogs();
    }
  }, [user?._id]);

  const deleteBlogHandle = (id) => {
    setBlogId(id);
    setBlogModal(true);
  };

  const fetchBlogs = async (page = 2) => {
    setLoadingMore(true);
    try {
      const response = await axios.get(
        `/api/blog/get-all-blogs?userId=${user._id}&page=${page}`
      );
      if (response.status === 200) {
        setUserBlogs([...userBlogs, ...response.data.blogs]);
        setPage(page + 1);

        if (response.data.blogs.length === 0) {
          setShowMoreButton(false);
          toast.success("All blogs have been fetched");
        }
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const showMoreBlogsButton = () => {
    fetchBlogs(page);
  };

  // Not an admin — show a real access message instead of an infinite spinner
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex flex-col w-full justify-center items-center text-center px-4">
        <div
          className={`p-4 rounded-full mb-4 ${
            isDark ? "bg-zinc-800" : "bg-gray-100"
          }`}
        >
          <HiLockClosed size={28} className="opacity-60" />
        </div>
        <h1 className="text-xl font-bold mb-1">Access restricted</h1>
        <p className="text-sm opacity-60">
          You need admin access to view this page.
        </p>
      </div>
    );
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
            Manage Blogs
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
                  <th className={thClass}>Post</th>
                  <th className={thClass}>Category</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody
                className={`divide-y ${
                  isDark ? "divide-zinc-800" : "divide-gray-100"
                }`}
              >
                {loader ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <BlogLoader />
                    </td>
                  </tr>
                ) : userBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16">
                      <div className="flex flex-col items-center gap-2 text-center">
                        <PiSmileySad size={32} className="opacity-40" />
                        <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
                          No blogs yet
                        </p>
                        <p className="text-sm opacity-60">
                          Blogs you publish will show up here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  userBlogs.map((data, index) => (
                    <tr
                      key={data._id || index}
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
                        {new Date(data.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Post (thumbnail + title) */}
                      <td className="py-4 px-5">
                        <NavLink
                          to={`/blog/${data.slug}`}
                          className="flex items-center gap-3 group max-w-sm"
                        >
                          <img
                            src={data.blogImgFile}
                            alt={data.blogTitle}
                            className="w-14 h-14 rounded-lg object-cover shrink-0"
                          />
                          <p
                            className={`text-sm font-medium line-clamp-2 transition-colors ${
                              isDark
                                ? "text-white group-hover:text-indigo-400"
                                : "text-zinc-900 group-hover:text-indigo-600"
                            }`}
                          >
                            {data.blogTitle}
                          </p>
                        </NavLink>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-5">
                        <span
                          className={`text-xs font-medium px-3 py-1 rounded-full border whitespace-nowrap ${
                            isDark
                              ? "border-indigo-400/40 text-indigo-300 bg-indigo-400/10"
                              : "border-indigo-500/30 text-indigo-600 bg-indigo-50"
                          }`}
                        >
                          {data.blogCategory}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-end gap-2">
                          <NavLink
                            to={`/update-blog/${data._id}`}
                            title="Edit"
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-zinc-700 text-gray-300"
                                : "hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            <HiOutlinePencil size={16} />
                          </NavLink>
                          <button
                            title="Delete"
                            onClick={() => deleteBlogHandle(data._id)}
                            className={`p-2 rounded-lg transition-colors ${
                              isDark
                                ? "hover:bg-red-500/10 text-red-400"
                                : "hover:bg-red-50 text-red-500"
                            }`}
                          >
                            <HiOutlineTrash size={16} />
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
                onClick={showMoreBlogsButton}
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

      <Toaster />

      {blogModal && (
        <BlogPopupModal
          blogModal={blogModal}
          setBlogModal={setBlogModal}
          blogId={blogId}
          setUserBlogs={setUserBlogs}
        />
      )}
    </>
  );
};

export default AllBlogs;