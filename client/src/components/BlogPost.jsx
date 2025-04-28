import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    fetchBlogPost();
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/blog/${slug}`);
      setPost(response.data);
      setError(null);
      
      // Fetch related posts
      fetchRelatedPosts(response.data.categories[0], response.data.destination, response.data._id);
    } catch (err) {
      setError('Failed to fetch blog post');
      console.error('Error fetching blog post:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async (category, destination, currentPostId) => {
    try {
      // First try to get posts with same category
      let response = await api.get('/blog', {
        params: {
          category,
          limit: 3
        }
      });
      
      let relatedPosts = response.data.posts.filter(post => post._id !== currentPostId);
      
      // If we don't have enough related posts, try with destination
      if (relatedPosts.length < 3 && destination) {
        response = await api.get('/blog', {
          params: {
            destination,
            limit: 3
          }
        });
        
        const destinationPosts = response.data.posts.filter(post => 
          post._id !== currentPostId && !relatedPosts.some(p => p._id === post._id)
        );
        
        relatedPosts = [...relatedPosts, ...destinationPosts].slice(0, 3);
      }
      
      // If still not enough, get latest posts
      if (relatedPosts.length < 3) {
        response = await api.get('/blog', {
          params: {
            limit: 5
          }
        });
        
        const latestPosts = response.data.posts.filter(post => 
          post._id !== currentPostId && !relatedPosts.some(p => p._id === post._id)
        );
        
        relatedPosts = [...relatedPosts, ...latestPosts].slice(0, 3);
      }
      
      setRelatedPosts(relatedPosts);
    } catch (err) {
      console.error('Error fetching related posts:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'Blog post not found'}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/blog')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Back to Blog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/blog')}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Blog
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <article className="bg-white shadow-md rounded-lg overflow-hidden">
            {(post.featuredImage?.url || post.images[0]?.url) && (
              <div className="h-64 md:h-96">
                <img
                  src={post.featuredImage?.url || post.images[0]?.url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories.map((category) => (
                  <Link
                    key={category}
                    to={`/blog?category=${category}`}
                    className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded"
                  >
                    {category}
                  </Link>
                ))}
              </div>
              
              <h1 className="text-3xl font-bold mb-3">{post.title}</h1>
              
              <div className="flex items-center text-gray-500 text-sm mb-6">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>{post.destination}</span>
                {post.author && (
                  <>
                    <span className="mx-2">•</span>
                    <span>By {post.author.username}</span>
                  </>
                )}
              </div>
              
              <div className="prose max-w-none">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
              
              {post.images.length > 1 && (
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {post.images.map((image, index) => (
                      <div key={index} className="h-40">
                        <img
                          src={image.url}
                          alt={`${post.title} - Image ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/blog?tag=${tag}`}
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white shadow-md rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">About the Destination</h2>
            <p className="text-gray-700 mb-4">
              Explore more about {post.destination} and plan your next adventure!
            </p>
            <Link
              to={`/search?destination=${post.destination}`}
              className="block w-full bg-indigo-600 text-white text-center py-2 rounded hover:bg-indigo-700"
            >
              Find Tours in {post.destination}
            </Link>
          </div>
          
          {relatedPosts.length > 0 && (
            <div className="bg-white shadow-md rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
              <div className="space-y-4">
                {relatedPosts.map((relatedPost) => (
                  <div key={relatedPost._id} className="flex">
                    <div className="w-20 h-20 flex-shrink-0">
                      <img
                        src={relatedPost.featuredImage?.url || relatedPost.images[0]?.url || 'https://via.placeholder.com/80'}
                        alt={relatedPost.title}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-medium">
                        <Link to={`/blog/${relatedPost.slug}`} className="hover:text-indigo-600">
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="text-gray-500 text-sm">
                        {formatDate(relatedPost.publishedAt || relatedPost.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
