import React, { useEffect, useState, Fragment } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import Loader from "../../components/layout/loader";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/login");

      try {
        const { data } = await axios.get("http://localhost:5000/api/v1/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(data.user);
      } catch (err) {
        console.error("Failed to load user", err);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) return <Loader />;

  return (
    <Fragment>
      {user && (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center px-4 py-10">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-10 w-full max-w-3xl">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <img
                src={user.avatar?.url || "/default-avatar.png"}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-orange-400 shadow-md object-cover"
              />
              <div className="text-center sm:text-left w-full">
                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                <p className="text-gray-500 mt-1">{user.email}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Joined: {String(user.createdAt).substr(0, 10)}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 mt-5">
                  <Link
                    to="/me/update"
                    className="bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600 transition w-full sm:w-auto text-center"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    to="/password/update"
                    className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition w-full sm:w-auto text-center"
                  >
                    Change Password
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
}