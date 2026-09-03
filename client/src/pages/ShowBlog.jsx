import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import BlogLoader from '../assests/blogSpinner/BlogLoader';
import { MdDateRange, MdUpdate } from 'react-icons/md';
import { BiCategoryAlt } from 'react-icons/bi';
import { HiArrowLeft } from 'react-icons/hi2';
import GithubCard from '../components/GithubCard';
import CommentCard from '../components/CommentCard';
import RecentBlog from '../components/RecentBlog';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const ShowBlog = () => {
  const { theme } = useSelector((state) => state.themeSliceApp);
  const isDark = theme === 'dark';

  const { blogSlug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loader, setLoader] = useState(false);
  const [limitBlogs, setLimitBlogs] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchBlogSlug = async () => {
      try {
        setLoader(true);
        const response = await axios.get(
          `/api/blog/get-all-blogs?slug=${blogSlug}`
        );
        if (response.status === 200) {
          setBlog(response.data.blogs[0] || null);
        }
      } catch (error) {
        console.log(error.message);
      } finally {
        setLoader(false);
      }
    };
    fetchBlogSlug();
    window.scrollTo(0, 0);
  }, [blogSlug]);

  useEffect(() => {
    const getLimitBlogs = async () => {
      try {
        const response = await axios.get(`/api/blog/get-all-blogs?limit=3`);
        if (response.status === 200) {
          setLimitBlogs(response.data.blogs);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    getLimitBlogs();
  }, []);

  useEffect(() => {
    if (blog && contentRef.current) {
      contentRef.current.querySelectorAll('pre.ql-syntax').forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }, [blog]);

  if (loader) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <BlogLoader />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-2xl font-bold mb-2">Blog not found</h1>
        <p className="opacity-60 mb-6">
          This post may have been removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-indigo-500 hover:bg-indigo-600 transition-colors"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const readMinutes = Math.max(1, Math.round(blog.blogBody.length / 1000));

  return (
    <div className="min-h-screen">
      <article className="pt-10 w-[90%] sm:w-[85%] md:w-[70%] lg:w-[60%] max-w-3xl m-auto">
        {/* Back link */}
        <Link
          to="/"
          className={`inline-flex items-center gap-1.5 text-sm font-medium mb-8 transition-colors ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <HiArrowLeft size={16} />
          Back to blogs
        </Link>

        {/* Category */}
        <div className="flex justify-center mb-4">
          <span
            className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-4 py-1.5 rounded-full ${
              isDark
                ? 'bg-indigo-400/10 text-indigo-300'
                : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            <BiCategoryAlt size={14} />
            {blog.blogCategory}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold text-center leading-tight">
          {blog.blogTitle}
        </h1>

        {/* Meta bar */}
        <div
          className={`flex justify-center items-center gap-6 mt-6 pb-6 mb-10 border-b text-sm ${
            isDark ? 'border-zinc-800 text-gray-400' : 'border-gray-200 text-gray-500'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <MdDateRange size={16} />
            {new Date(blog.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <span className={isDark ? 'text-zinc-700' : 'text-gray-300'}>•</span>
          <span className="flex items-center gap-1.5">
            <MdUpdate size={16} />
            {readMinutes} min read
          </span>
        </div>

        {/* Cover image temporarily hidden */}
        {/*
        <div className="mb-10 rounded-xl overflow-hidden">
          <img
            src={blog.blogImgFile}
            alt={blog.blogTitle}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
        */}

        {/* Body */}
        <div
          ref={contentRef}
          dangerouslySetInnerHTML={{ __html: blog.blogBody }}
          className={`blog-content leading-8 text-justify ${
            isDark ? 'prose-invert' : ''
          }`}
        />

        {/* GitHub */}
        <div className="flex justify-center mt-16">
          <GithubCard />
        </div>

        {/* Comments */}
        <div className="mt-16">
          <CommentCard blogId={blog._id} />
        </div>
      </article>

      {/* Related posts */}
      {limitBlogs.length > 0 && (
  <section className="w-[90%] md:w-[85%] max-w-6xl m-auto mt-20 pb-20">
    <div className="text-center mb-10">
      <p className="text-xs font-semibold uppercase tracking-[3px] text-indigo-400 mb-2">
        Keep Reading
      </p>
      <h2 className="text-2xl md:text-3xl font-bold">More from the blog</h2>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
      {limitBlogs.map((value) => (
        <RecentBlog key={value._id} blog={value} />
      ))}
    </div>
  </section>
)}
    </div>
  );
};

export default ShowBlog;