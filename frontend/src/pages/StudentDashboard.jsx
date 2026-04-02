// Student Dashboard
import { useState, useEffect } from 'react';
import { enrollmentAPI } from '../services/api';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await enrollmentAPI.getStudentEnrollments();
      setEnrollments(response.data.enrollments);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-light dark:bg-dark py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-dark dark:text-white mb-2">Welcome, {user.name}!</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your learning progress and continue your courses</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Courses Enrolled</h3>
            <p className="text-4xl font-bold text-primary">{enrollments.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">In Progress</h3>
            <p className="text-4xl font-bold text-secondary">
              {enrollments.filter(e => e.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-500">
              {enrollments.filter(e => e.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-2">Certificates</h3>
            <p className="text-4xl font-bold text-purple-500">
              {enrollments.filter(e => e.certificateIssued).length}
            </p>
          </div>
        </div>

        {/* My Courses */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">My Courses</h2>

          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't enrolled in any courses yet</p>
              <Link to="/courses" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const statusColor = enrollment.status === 'completed'
                  ? 'bg-green-100 text-green-800'
                  : enrollment.status === 'in-progress'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800';
                return (
                  <div
                    key={enrollment._id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-dark dark:text-white">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                          {enrollment.course.description.substring(0, 100)}...
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColor}`}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-semibold">Progress</span>
                        <span className="text-sm font-semibold">{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Videos watched: {enrollment.completedVideos.length}
                      </div>
                      <Link
                        to={`/course/${enrollment.course._id}`}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Continue Learning
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
