import React from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import BlogPosts from '../../components/admin/BlogPosts';

const BlogPostsPage = () => {
  return (
    <AdminLayout>
      <BlogPosts />
    </AdminLayout>
  );
};

export default BlogPostsPage;
