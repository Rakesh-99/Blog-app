import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { NavLink } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { TiTick } from "react-icons/ti";
import { ImWarning } from "react-icons/im";
import { IoClose } from "react-icons/io5";
import toast, { Toaster } from "react-hot-toast";
import BlogLoader from "../assests/blogSpinner/BlogLoader";

const AllUsers = () => {
  const { user } = useSelector((state) => state.userSliceApp);
  const { theme } = useSelector((state) => state.themeSliceApp);
  const isDark = theme === "dark";

  const [loader, setLoader] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [getAllUsers, setAllUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [userId, setUserId] = useState("");
  const [startPage, setStartPage] = useState(3);

  useEffect(() => {
    if (user?.isAdmin) {
      const getUsers = async () => {
        setLoader(true);
        try {
          const userInfo = await axios.get(`/api/user/getusers`, {
            headers: { Authorization: user.token },
          });
          const response = userInfo.data.user;
          setAllUsers(response);
          setShowMoreButton(response.length > 8);
        } catch (error) {
          console.log(error.message);
        } finally {
          setLoader(false);
        }
      };
      getUsers();
    }
  }, [user?._id]);

  const deleteUserHandle = (id) => {
    setShowModal(true);
    setUserId(id);
  };

  const cancelHandle = () => {
    setShowModal(false);
  };

  const deleteUser = async () => {
    try {
      setShowModal(false);

      const userDelete = await axios.delete(`/api/user/deleteuser/${userId}`, {
        data: { user: user },
        headers: { Authorization: user.token },
      });

      if (userDelete.status === 200) {
        setAllUsers((users) => users.filter((u) => u._id !== userId));
        toast.success("User has been deleted successfully");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
      console.log(error.response?.data?.message);
    }
  };

  const showMoreUserButton = async () => {
    setLoadingMore(true);
    try {
      const showMoreUser = await axios.get(`/api/user/getusers?page=${startPage}`, {
        headers: { Authorization: user.token },
      });

      if (showMoreUser.status === 200) {
        if (showMoreUser.data.user.length > 0) {
          setAllUsers((prevUsers) => [...prevUsers, ...showMoreUser.data.user]);
          setStartPage((prevPage) => prevPage + 1);
        } else {
          setShowMoreButton(false);
        }
      }
    } catch (error) {
      console.log(error.message);
    } finally {
      setLoadingMore(false);
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
            Manage Users
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
                  <th className={thClass}>Joined / Updated</th>
                  <th className={thClass}>User</th>
                  <th className={thClass}>Email</th>
                  <th className={`${thClass} text-center`}>Admin</th>
                  <th className={`${thClass} text-right`}>Actions</th>
                </tr>
              </thead>

              <tbody
                className={`divide-y ${isDark ? "divide-zinc-800" : "divide-gray-100"}`}
              >
                {loader ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <BlogLoader />
                    </td>
                  </tr>
                ) : getAllUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <p className={`font-semibold ${isDark ? "text-white" : "text-zinc-900"}`}>
                        No users found
                      </p>
                    </td>
                  </tr>
                ) : (
                  getAllUsers.map((u) => (
                    <tr
                      key={u._id}
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
                        {new Date(u.updatedAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>

                      {/* Avatar + username */}
                      <td className="py-4 px-5">
                        <NavLink
                          to={`/blog`}
                          className="flex items-center gap-3 group"
                        >
                          <img
                            src={u.profilePicture}
                            alt={u.username}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                          <p
                            className={`text-sm font-medium ${
                              isDark
                                ? "text-white group-hover:text-indigo-400"
                                : "text-zinc-900 group-hover:text-indigo-600"
                            }`}
                          >
                            {u.username}
                          </p>
                        </NavLink>
                      </td>

                      {/* Email */}
                      <td
                        className={`py-4 px-5 text-sm ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {u.email}
                      </td>

                      {/* Admin badge */}
                      <td className="py-4 px-5 text-center">
                        {u.isAdmin ? (
                          <TiTick color="#22c55e" size={22} className="inline" />
                        ) : (
                          <RxCross2 color="#ef4444" size={18} className="inline" />
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5">
                        <div className="flex justify-end">
                          <button
                            title="Delete"
                            onClick={() => deleteUserHandle(u._id)}
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
                onClick={showMoreUserButton}
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
                Are you sure you want to delete this user?
              </p>
              <p className="text-sm text-center opacity-60">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                className="flex-1 text-sm rounded-lg transition-all active:scale-95 font-semibold py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white"
                onClick={deleteUser}
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

export default AllUsers;