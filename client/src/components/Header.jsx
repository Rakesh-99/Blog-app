import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { RxHamburgerMenu } from "react-icons/rx";
import { AiOutlineClose } from "react-icons/ai";
import { LuSunMedium } from "react-icons/lu";
import { HiMoon } from "react-icons/hi";
import { IoMdSearch } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { changeTheme } from '../features/themeSlice';
import { signOutSuccess, signOutUserFailure } from '../features/userSlice';
import axios from 'axios';
import { CgProfile } from "react-icons/cg";
import { PiSignOutDuotone } from "react-icons/pi";
import { MdOutlineKeyboardDoubleArrowRight } from "react-icons/md";
import { AnimatePresence, motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.userSliceApp);
  const { theme } = useSelector((state) => state.themeSliceApp);

  const [toggleNavBtn, setToggleNavBtn] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const [searchBlog, setSearchBlog] = useState('');

  const dropDownRef = useRef(null);
  const isDark = theme === 'dark';

  const themeToggle = () => {
    dispatch(changeTheme());
  };

  const signOutHandle = async () => {
    try {
      const signOutUser = await axios.post(`/api/user/signoutuser`);
      if (signOutUser.data.success === true) {
        dispatch(signOutSuccess());
      }
    } catch (error) {
      dispatch(signOutUserFailure(error));
    }
  };

  const submitHandle = (e) => {
    e.preventDefault();
    const getURL = new URLSearchParams(location.search);
    getURL.set('searchBlog', searchBlog);
    navigate(`/search?${getURL.toString()}`);
  };

  useEffect(() => {
    const getURL = new URLSearchParams(location.search);
    const getData = getURL.get('searchBlog');
    if (getData) setSearchBlog(getData);
  }, [location.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropDownRef.current && !dropDownRef.current.contains(e.target)) {
        setDropDown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setDropDown(false);
    setToggleNavBtn(false);
  }, [location.pathname]);

  const navLinkClass = (path) =>
    `relative font-medium text-sm transition-colors ${
      location.pathname === path
        ? 'text-indigo-500'
        : isDark
        ? 'text-gray-300 hover:text-white'
        : 'text-gray-600 hover:text-gray-900'
    }`;

  return (
    <nav
      className={`sticky top-0 z-30 backdrop-blur-md border-b transition-colors ${
        isDark
          ? 'bg-zinc-900/80 border-zinc-800'
          : 'bg-white/80 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center shrink-0 group">
          <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-zinc-900'}`}>
            Draft
          </span>
          <span className="text-lg font-bold px-2 py-0.5 ml-0.5 rounded-md text-white bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:from-pink-500 group-hover:to-yellow-500 transition-all duration-300">
            code
          </span>
        </NavLink>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/about" className={navLinkClass('/about')}>
            About
            {location.pathname === '/about' && (
              <motion.span
                layoutId="nav-underline"
                className="absolute -bottom-2 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
              />
            )}
          </NavLink>
        </div>

        {/* Desktop search */}
        <form
          onSubmit={submitHandle}
          className="hidden md:flex items-center relative flex-1 max-w-xs"
        >
          <IoMdSearch
            size={18}
            className={`absolute left-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          />
          <input
            value={searchBlog}
            onChange={(e) => setSearchBlog(e.target.value)}
            type="text"
            placeholder="Search articles..."
            className={`w-full text-sm pl-9 pr-3 py-2 rounded-full border outline-none transition-all focus:ring-2 focus:ring-indigo-400 ${
              isDark
                ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500'
                : 'bg-gray-100 border-transparent placeholder:text-gray-400'
            }`}
          />
        </form>

        {/* Right controls (desktop) */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          <button
            onClick={themeToggle}
            aria-label="Toggle theme"
            className={`p-2 rounded-full transition-colors ${
              isDark ? 'hover:bg-zinc-800 text-yellow-300' : 'hover:bg-gray-100 text-orange-400'
            }`}
          >
            {isDark ? <LuSunMedium size={20} /> : <HiMoon size={20} />}
          </button>

          {user ? (
            <div className="relative" ref={dropDownRef}>
              <button onClick={() => setDropDown(!dropDown)} className="block">
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-transparent hover:ring-indigo-400 transition-all"
                />
              </button>

              <AnimatePresence>
                {dropDown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-3 w-44 rounded-xl border shadow-lg overflow-hidden ${
                      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <NavLink
                      to="/dashboard?tab=profile"
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        isDark ? 'hover:bg-zinc-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <CgProfile size={18} />
                      Profile
                    </NavLink>
                    <div className={`h-px ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />
                    <button
                      onClick={signOutHandle}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                        isDark ? 'hover:bg-zinc-700 text-gray-200' : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <PiSignOutDuotone size={18} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            location.pathname !== '/login' &&
            location.pathname !== '/register' && (
              <NavLink
                to="/login"
                className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white font-semibold text-sm rounded-full pl-4 pr-3 py-2 transition-all active:scale-95"
              >
                Get started
                <MdOutlineKeyboardDoubleArrowRight size={18} />
              </NavLink>
            )
          )}
        </div>

        {/* Mobile controls */}
        <div className="md:hidden flex items-center gap-1">
          <button
            onClick={() => navigate('/search')}
            className={`p-2 rounded-full ${isDark ? 'active:bg-zinc-800' : 'active:bg-gray-100'}`}
          >
            <IoMdSearch size={22} />
          </button>

          <button
            onClick={themeToggle}
            className={`p-2 rounded-full ${
              isDark ? 'active:bg-zinc-800 text-yellow-300' : 'active:bg-gray-100 text-orange-400'
            }`}
          >
            {isDark ? <LuSunMedium size={20} /> : <HiMoon size={20} />}
          </button>

          {user && (
            <div className="relative" ref={dropDownRef}>
              <button onClick={() => setDropDown(!dropDown)}>
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>

              <AnimatePresence>
                {dropDown && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 mt-3 w-40 rounded-xl border shadow-lg overflow-hidden ${
                      isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <NavLink
                      to="/dashboard?tab=profile"
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                        isDark ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <CgProfile size={16} />
                      Profile
                    </NavLink>
                    <div className={`h-px ${isDark ? 'bg-zinc-700' : 'bg-gray-200'}`} />
                    <button
                      onClick={signOutHandle}
                      className={`w-full flex items-center gap-2 px-4 py-3 text-sm font-medium ${
                        isDark ? 'hover:bg-zinc-700' : 'hover:bg-gray-100'
                      }`}
                    >
                      <PiSignOutDuotone size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <button
            onClick={() => setToggleNavBtn(!toggleNavBtn)}
            className={`p-2 rounded-full ${isDark ? 'active:bg-zinc-800' : 'active:bg-gray-100'}`}
          >
            {toggleNavBtn ? <AiOutlineClose size={20} /> : <RxHamburgerMenu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {toggleNavBtn && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden overflow-hidden border-t ${
              isDark ? 'border-zinc-800' : 'border-gray-200'
            }`}
          >
            <div className="flex flex-col items-center gap-4 py-6">
              <NavLink
                to="/about"
                onClick={() => setToggleNavBtn(false)}
                className={navLinkClass('/about')}
              >
                About me
              </NavLink>

              {!user &&
                location.pathname !== '/login' &&
                location.pathname !== '/register' && (
                  <NavLink
                    to="/login"
                    onClick={() => setToggleNavBtn(false)}
                    className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold text-sm rounded-full pl-4 pr-3 py-2 transition-all active:scale-95"
                  >
                    Get started
                    <MdOutlineKeyboardDoubleArrowRight size={18} />
                  </NavLink>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;