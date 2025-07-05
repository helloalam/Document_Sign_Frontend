import React, { useState, Fragment, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../components/context/AuthContext";
import API from "../../utils/api";
import { toast } from "react-toastify";
import Loader from "../../components/layout/loader";

export default function LoginSignUp() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [user, setUser] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("/profile.png");

  const handleSwitch = () => setIsLogin(!isLogin);

  const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data } = await API.post("/login", {
      email: loginEmail,
      password: loginPassword,
    });
    localStorage.setItem("token", data.token);
    login(data.user);
    toast.success("Login successful!");
    navigate("/profile");
  } catch (err) {
    setError(err.response?.data?.message || "Login failed");
  } finally {
    setLoading(false);
  }
};


const handleRegister = async (e) => {
  e.preventDefault();
  const formData = new FormData();
  formData.set("name", user.name);
  formData.set("email", user.email);
  formData.set("password", user.password);
  if (avatar) formData.set("avatar", avatar);

  setLoading(true);
  try {
    const { data } = await API.post("/register", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    localStorage.setItem("token", data.token);
    login(data.user);
    toast.success("Registered successfully!");
    navigate("/profile");
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed");
  } finally {
    setLoading(false);
  }
};


  const handleInputChange = (e) => {
    if (e.target.name === "avatar") {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setAvatarPreview(reader.result);
          setAvatar(file);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setUser({ ...user, [e.target.name]: e.target.value });
    }
  };

  return (
    <Fragment>
      {loading ? (
        <Loader />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between mb-6">
              <button
                onClick={handleSwitch}
                className={`w-1/2 py-2 font-semibold transition ${
                  isLogin ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"
                }`}
              >
                Login
              </button>
              <button
                onClick={handleSwitch}
                className={`w-1/2 py-2 font-semibold transition ${
                  !isLogin ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <p className="text-sm text-red-500 mb-4 text-center">{error}</p>
            )}

            {isLogin ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <Link
                  to="/password/forgot"
                  className="text-sm text-orange-500 hover:underline block text-right"
                >
                  Forgot Password?
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            ) : (
              <form
                onSubmit={handleRegister}
                encType="multipart/form-data"
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={user.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={user.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Avatar</label>
                  <div className="flex items-center gap-4">
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <input
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleInputChange}
                      className="text-sm"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {loading ? "Registering..." : "Register"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
}