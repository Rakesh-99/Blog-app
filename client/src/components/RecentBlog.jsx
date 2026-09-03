import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const getBlogDescription = (blogBody = '') =>
  blogBody.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const formatBlogDate = (date) =>
  new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const RecentBlog = ({ blog }) => {
  const { theme } = useSelector((state) => state.themeSliceApp);
  const isDark = theme === 'dark';

  if (!blog) return null;

  return (
    <Link to={`/blog/${blog.slug}`} className="group block w-full h-full">
      <div
        className={`h-full flex flex-col rounded-2xl border overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
          isDark
            ? 'border-zinc-700/80 bg-zinc-900/90 hover:border-zinc-600'
            : 'border-zinc-200 bg-white hover:border-zinc-300'
        }`}
      >
        {/* Content — flex-1 fills remaining height so the badge
            always sits at the bottom regardless of title length */}
        <div className="flex flex-col gap-4 px-6 py-6 flex-1">
          <span
            className={`text-[10px] font-bold uppercase tracking-[1.5px] w-fit px-3 py-1.5 rounded-full border ${
              isDark
                ? 'border-indigo-400/30 bg-indigo-400/10 text-indigo-300'
                : 'border-indigo-200 bg-indigo-50 text-indigo-600'
            }`}
          >
            {blog.blogCategory}
          </span>
          <p
            className={`text-lg font-bold leading-snug line-clamp-2 min-h-[3.5rem] transition-colors ${
              isDark
                ? 'text-white group-hover:text-indigo-400'
                : 'text-zinc-900 group-hover:text-indigo-600'
            }`}
          >
            {blog.blogTitle}
          </p>

          <p className="text-sm leading-6 opacity-65 line-clamp-3 min-h-[4.5rem]">
            {getBlogDescription(blog.blogBody)}
          </p>

          <div className="flex flex-wrap gap-2 pt-2 text-[11px] opacity-60 border-t border-current/10 mt-auto">
            <span className="rounded-full bg-current/5 px-2.5 py-1">
              Created {formatBlogDate(blog.createdAt)}
            </span>
            <span className="rounded-full bg-current/5 px-2.5 py-1">
              Updated {formatBlogDate(blog.updatedAt)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default RecentBlog;