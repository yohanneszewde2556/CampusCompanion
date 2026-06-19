import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const modules = [
  {
    title: 'Lost & Found',
    description: 'Report lost items, browse found items, and get AI-powered match alerts.',
    to: '/lost-found',
    color: 'from-blue-500 to-indigo-600',
    available: true,
  },
  {
    title: 'AI Assistant',
    description: 'Study planner, assignment reminders, note summarization, and chatbot help.',
    to: '#',
    color: 'from-violet-500 to-purple-600',
    available: false,
  },
  {
    title: 'Marketplace',
    description: 'Buy and sell books, electronics, and campus essentials with fellow students.',
    to: '#',
    color: 'from-emerald-500 to-teal-600',
    available: false,
  },
  {
    title: 'Study Groups',
    description: 'Create groups, share resources, chat, and schedule meetings.',
    to: '#',
    color: 'from-orange-500 to-amber-600',
    available: false,
  },
  {
    title: 'Announcements',
    description: 'University news, department updates, events, and emergency alerts.',
    to: '#',
    color: 'from-rose-500 to-pink-600',
    available: false,
  },
];

const Dashboard = () => {
  const userInfo = useSelector((state) => state.auth.userInfo);

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          Welcome back, {userInfo?.firstName}!
        </h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Everything you need for campus life, in one place.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <div
            key={module.title}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-800"
          >
            <div className={`h-2 bg-gradient-to-r ${module.color}`} />
            <div className="p-6">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{module.title}</h2>
                {!module.available && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                    Soon
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                {module.description}
              </p>
              {module.available ? (
                <Link
                  to={module.to}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Open module
                  <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ) : (
                <p className="mt-4 text-sm font-medium text-gray-400">Coming in a future release</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
