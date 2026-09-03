import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoMdSearch } from 'react-icons/io';
import { HiOutlineAdjustmentsHorizontal } from 'react-icons/hi2';
import BlogLoader from '../assests/blogSpinner/BlogLoader';
import NodataImg from '../assests/No data.png';

const getBlogDescription = (blogBody = '') =>
  blogBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const formatBlogDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const categories = [
  'All',
  'uncategorized',
  'Java',
  'Javascript',
  'React.Js',
  'Git',
  'MongoDB',
];

const Search = () => {
  const { theme } = useSelector((state) => state.themeSliceApp);
  const location = useLocation();
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMoreButton, setShowMoreButton] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    searchblog: '',
    sortblog: 'desc',
    blogcategory: 'All',
  });

  const inputChangeHandle = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  useEffect(() => {
    const URL = new URLSearchParams(location.search);
    const getBlog = URL.get('searchBlog');
    const getBlogCategory = URL.get('category');
    const sortBlog = URL.get('sort');

    setFormData((prevFormData) => ({
      ...prevFormData,
      searchblog: getBlog || '',
      blogcategory: getBlogCategory || 'All',
      sortblog: sortBlog || 'desc',
    }));

    const fetchBlogPosts = async () => {
      const stringConversionURL = URL.toString();
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/blog/get-all-blogs?${stringConversionURL}`
        );

        if (response.status === 200) {
          setBlogs(response.data.blogs);
          setShowMoreButton(response.data.blogs.length > 9);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, [location.search]);

  const submitHandle = (e) => {
    e.preventDefault();
    const URL = new URLSearchParams(location.search);
    URL.set('sort', formData.sortblog);
    if (formData.searchblog) {
      URL.set('searchBlog', formData.searchblog);
    } else {
      URL.delete('searchBlog');
    }
    if (formData.blogcategory === 'All') {
      URL.delete('category');
    } else {
      URL.set('category', formData.blogcategory);
    }
    URL.delete('page');
    navigate(`/search?${URL.toString()}`);
    setShowFilters(false);
  };

  const inputClass = `w-full py-2.5 px-4 text-sm rounded-lg border outline-none transition-all focus:ring-2 focus:ring-indigo-400/60 ${
    isDark
      ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500'
      : 'bg-white border-gray-300 placeholder:text-gray-400'
  }`;

  const FilterForm = (
    <form onSubmit={submitHandle} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide opacity-60">
          Search
        </label>
        <div className="relative">
          <IoMdSearch
            size={16}
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}
          />
          <input
            type="text"
            placeholder="Search blog..."
            className={`${inputClass} pl-9`}
            onChange={inputChangeHandle}
            name="searchblog"
            value={formData.searchblog}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide opacity-60">
          Sort
        </label>
        <select
          name="sortblog"
          className={inputClass}
          onChange={inputChangeHandle}
          value={formData.sortblog}
        >
          <option value="desc">Latest</option>
          <option value="asc">Oldest</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide opacity-60">
          Category
        </label>
        <select
          name="blogcategory"
          className={inputClass}
          onChange={inputChangeHandle}
          value={formData.blogcategory}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        className="mt-1 py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 active:scale-[0.98] transition-all"
      >
        Apply Filters
      </button>
    </form>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 min-h-screen">
      <div className="md:flex gap-10 pt-10">
        {/* Mobile filter toggle */}
        <div className="md:hidden flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Search</h1>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg border ${
              isDark ? 'border-zinc-700' : 'border-gray-300'
            }`}
          >
            <HiOutlineAdjustmentsHorizontal size={16} />
            Filters
          </button>
        </div>

        {/* Sidebar */}
        <aside
          className={`md:block ${showFilters ? 'block' : 'hidden'} md:w-72 shrink-0 mb-8 md:mb-0`}
        >
          <div
            className={`md:sticky md:top-24 rounded-2xl border p-6 ${
              isDark ? 'border-zinc-700 bg-zinc-800' : 'border-gray-200 bg-white'
            }`}
          >
            <h2 className="text-lg font-bold mb-5 hidden md:block">
              Refine Results
            </h2>
            {FilterForm}
          </div>
        </aside>

        {/* Results — min-w-0 is the fix: without it, the grid forces this
            flex child wider than the available space and overflows the viewport */}
        <div className="flex-1 min-w-0 pb-16">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <BlogLoader />
            </div>
          ) : blogs.length > 0 ? (
            <>
              <p className="text-sm opacity-60 mb-6">
                {blogs.length} result{blogs.length !== 1 ? 's' : ''} found
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {blogs.map((value, index) => (
                  <Link key={value._id || index} to={`/blog/${value?.slug}`}>
                    <div
                        className={`group h-full rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden ${
                        isDark
                            ? 'border-zinc-700/80 bg-zinc-900/90 hover:border-zinc-600'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                      }`}
                    >
                      <div className="p-6 flex flex-col gap-4">
                        <span
                          className={`text-[10px] w-fit font-bold uppercase tracking-[1.5px] px-3 py-1.5 rounded-full border ${
                            isDark
                              ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300'
                              : 'border-indigo-200 bg-indigo-50 text-indigo-600'
                          }`}
                        >
                          {value?.blogCategory}
                        </span>
                        <p className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-indigo-400 transition-colors">
                          {value?.blogTitle}
                        </p>
                        <p className="text-sm leading-6 opacity-65 line-clamp-3 min-h-[4.5rem]">
                          {getBlogDescription(value?.blogBody)}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-2 text-[11px] opacity-60 border-t border-current/10">
                          <span className="rounded-full bg-current/5 px-2.5 py-1">
                            Created {formatBlogDate(value?.createdAt)}
                          </span>
                          <span className="rounded-full bg-current/5 px-2.5 py-1">
                            Updated {formatBlogDate(value?.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {showMoreButton && (
                <div className="flex justify-center mt-10">
                  <button
                    className={`px-6 py-2.5 rounded-full text-sm font-semibold border transition-colors ${
                      isDark
                        ? 'border-zinc-700 hover:bg-zinc-800'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex flex-col items-center py-16 text-center">
              <img src={NodataImg} className="w-72 md:w-96 mb-4" alt="No results" />
              <h1 className="text-xl font-bold">Oops! No blogs found</h1>
              <p className="text-sm opacity-60 mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;