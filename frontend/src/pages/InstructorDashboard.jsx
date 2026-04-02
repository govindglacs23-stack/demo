// Instructor Dashboard
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseAPI } from '../services/api';
import { FiPlus, FiX } from 'react-icons/fi';

export default function InstructorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [videoData, setVideoData] = useState({ title: '', description: '', videoUrl: '', duration: 0 });
  const [resourceData, setResourceData] = useState({ title: '', type: 'video', url: '', description: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    level: 'Beginner',
    price: 0,
    thumbnail: 'https://via.placeholder.com/300x200',
    duration: 0,
  });
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseAPI.getInstructorCourses();
      setCourses(response.data.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Programming',
      level: 'Beginner',
      price: 0,
      thumbnail: 'https://via.placeholder.com/300x200',
      duration: 0,
    });
    setIsEditMode(false);
    setEditingId(null);
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await courseAPI.createCourse(formData);
      setCourses([...courses, response.data.course]);
      setShowModal(false);
      resetForm();
      alert('Course created successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const response = await courseAPI.updateCourse(editingId, formData);
      setCourses(courses.map((c) => (c._id === editingId ? response.data.course : c)));
      setShowModal(false);
      resetForm();
      alert('Course updated successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update course');
    }
  };

  const handleEditCourse = (course) => {
    setEditingId(course._id);
    setIsEditMode(true);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || 'Programming',
      level: course.level || 'Beginner',
      price: course.price || 0,
      thumbnail: course.thumbnail || 'https://via.placeholder.com/300x200',
      duration: course.duration || 0,
    });
    setShowModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await courseAPI.deleteCourse(courseId);
        setCourses(courses.filter(c => c._id !== courseId));
        alert('Course deleted successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete course');
      }
    }
  };

  const handlePublishCourse = async (courseId) => {
    try {
      const response = await courseAPI.publishCourse(courseId);
      setCourses(courses.map(c => c._id === courseId ? response.data.course : c));
      alert('Course published successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to publish course');
    }
  };

  const handleAddVideo = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const response = await courseAPI.addVideo(editingId, videoData);
      setCourses(courses.map(c => c._id === editingId ? response.data.course : c));
      setVideoData({ title: '', description: '', videoUrl: '', duration: 0 });
      alert('Video added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add video');
    }
  };

  const handleDeleteVideo = async (courseId, videoId) => {
    try {
      await courseAPI.deleteVideo(courseId, videoId);
      setCourses(courses.map(c => {
        if (c._id === courseId) {
          return { ...c, videos: c.videos.filter(v => v._id !== videoId) };
        }
        return c;
      }));
      alert('Video deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete video');
    }
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    if (!editingId) return;

    try {
      const response = await courseAPI.addResource(editingId, resourceData);
      setCourses(courses.map(c => c._id === editingId ? response.data.course : c));
      setResourceData({ title: '', type: 'video', url: '', description: '' });
      alert('Resource added successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add resource');
    }
  };

  const handleDeleteResource = async (courseId, resourceId) => {
    try {
      await courseAPI.deleteResource(courseId, resourceId);
      setCourses(courses.map(c => {
        if (c._id === courseId) {
          return { ...c, resources: c.resources?.filter(r => r._id !== resourceId) || [] };
        }
        return c;
      }));
      alert('Resource deleted successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete resource');
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-dark dark:text-white mb-2">Welcome, {user.name}!</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your courses and monitor student progress</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            <FiPlus /> Create Course
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Total Courses</h3>
            <p className="text-4xl font-bold text-primary">{courses.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Total Students</h3>
            <p className="text-4xl font-bold text-secondary">
              {courses.reduce((sum, c) => sum + c.totalStudents, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Published</h3>
            <p className="text-4xl font-bold text-green-500">
              {courses.filter(c => c.isPublished).length}
            </p>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">My Courses</h2>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't created any courses yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const statusClass = course.isPublished
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800';
                return (
                  <div
                    key={course._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
                        {course.title}
                      </h3>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-sm font-semibold px-2 py-1 rounded ${statusClass}`}>
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {course.totalStudents} students
                        </span>
                      </div>
                      <div className="flex gap-2 text-sm">
                        <button
                          onClick={() => navigate(`/instructor/course/${course._id}/edit`)}
                          className="flex-1 bg-blue-100 text-blue-800 py-2 rounded hover:bg-blue-200"
                        >
                          Edit
                        </button>
                        {!course.isPublished && (
                          <button
                            onClick={() => handlePublishCourse(course._id)}
                            className="flex-1 bg-green-100 text-green-800 py-2 rounded hover:bg-green-200"
                          >
                            Publish
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          className="flex-1 bg-red-100 text-red-800 py-2 rounded hover:bg-red-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-md w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-dark dark:text-white">
                {isEditMode ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={isEditMode ? handleUpdateCourse : handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., React Basics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Description *
                </label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Course description..."
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Programming">Programming</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Development">Development</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Level
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Price
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark dark:text-white mb-2">
                  Duration (hours)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-dark dark:text-white outline-none focus:ring-2 focus:ring-primary"
                  placeholder="0"
                />
              </div>

              {isEditMode && (
                <>
                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mt-4">
                    <h3 className="text-lg font-semibold mb-2">Videos (for Udemy-style content)</h3>
                    <div className="space-y-3 mb-4">
                      {courses.find(c => c._id === editingId)?.videos?.length ? (
                        courses.find(c => c._id === editingId).videos.map(video => (
                          <div key={video._id} className="flex justify-between gap-2 items-center rounded border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
                            <div>
                              <p className="text-sm font-semibold text-dark dark:text-white">{video.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{video.duration} min</p>
                            </div>
                            <button onClick={() => handleDeleteVideo(editingId, video._id)} className="text-red-500 text-xs">Delete</button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No videos yet.</p>
                      )}
                    </div>

                    <form onSubmit={handleAddVideo} className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Video title"
                        value={videoData.title}
                        onChange={(e) => setVideoData({ ...videoData, title: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                      />
                      <input
                        type="text"
                        required
                        placeholder="YouTube URL or video URL"
                        value={videoData.videoUrl}
                        onChange={(e) => setVideoData({ ...videoData, videoUrl: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                      />
                      <textarea
                        placeholder="Description"
                        value={videoData.description}
                        onChange={(e) => setVideoData({ ...videoData, description: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                        rows={2}
                      />
                      <input
                        type="number"
                        required
                        placeholder="Duration (minutes)"
                        value={videoData.duration}
                        onChange={(e) => setVideoData({ ...videoData, duration: parseInt(e.target.value) })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                      />
                      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Add Video</button>
                    </form>
                  </div>

                  <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mt-4">
                    <h3 className="text-lg font-semibold mb-2">Resources (PDF/DOC/Links)</h3>
                    <div className="space-y-3 mb-4">
                      {courses.find(c => c._id === editingId)?.resources?.length ? (
                        courses.find(c => c._id === editingId).resources.map(resource => (
                          <div key={resource._id} className="flex justify-between gap-2 items-center rounded border border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-800">
                            <div>
                              <p className="text-sm font-semibold text-dark dark:text-white">{resource.title} ({resource.type})</p>
                              <a href={resource.url} target="_blank" rel="noreferrer" className="text-xs text-blue-500">Open</a>
                            </div>
                            <button onClick={() => handleDeleteResource(editingId, resource._id)} className="text-red-500 text-xs">Delete</button>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-400">No resources yet.</p>
                      )}
                    </div>

                    <form onSubmit={handleAddResource} className="space-y-2">
                      <input
                        type="text"
                        required
                        placeholder="Resource title"
                        value={resourceData.title}
                        onChange={(e) => setResourceData({ ...resourceData, title: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                      />
                      <select
                        value={resourceData.type}
                        onChange={(e) => setResourceData({ ...resourceData, type: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="doc">DOC</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="url"
                        required
                        placeholder="Resource URL"
                        value={resourceData.url}
                        onChange={(e) => setResourceData({ ...resourceData, url: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                      />
                      <textarea
                        placeholder="Description"
                        value={resourceData.description}
                        onChange={(e) => setResourceData({ ...resourceData, description: e.target.value })}
                        className="w-full rounded border border-gray-300 dark:border-gray-700 px-2 py-1"
                        rows={2}
                      />
                      <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Add Resource</button>
                    </form>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {isEditMode ? 'Update Course' : 'Create Course'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
