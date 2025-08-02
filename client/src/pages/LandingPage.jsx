import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between">
      {/* Navbar */}
      <header className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-wide">CodeSync</h1>
        <div className="space-x-4">
          <Link to="/login" className="text-white hover:text-gray-300">
            Login
          </Link>
          <Link
            to="/register"
            className="bg-white text-black px-4 py-2 rounded-md hover:bg-gray-200"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center text-center px-6 py-20">
        <h2 className="text-4xl sm:text-5xl font-bold mb-6">
          Real-Time Collaborative Code Editor
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl text-gray-300 mb-8">
          Collaborate with your team in real-time. Write, edit, and chat
          — all in one beautiful and responsive interface.
        </p>
        <Link
          to="/register"
          className="bg-white text-black px-6 py-3 rounded-md text-lg font-medium hover:bg-gray-200"
        >
          Start Collaborating
        </Link>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} CodeSync. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
