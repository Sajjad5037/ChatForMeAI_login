import { useState } from "react";
import { UserPlus } from "lucide-react"; // You can replace this with an emoji if you don't want to install lucide-react

export default function SignupPage_ShahRukh() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.email.includes("@")) newErrors.email = "Invalid email";
    if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setSubmitted(true);
      console.log("Form submitted:", form);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-300 via-purple-200 to-pink-300 px-4">
      <div className="backdrop-blur-xl bg-white/30 border border-white/40 shadow-2xl p-10 rounded-3xl w-full max-w-md">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto text-white bg-blue-600 p-2 rounded-full" size={50} />
          <h2 className="text-3xl font-extrabold text-white mt-4">Welcome!</h2>
          <p className="text-white/80 text-sm">Create an account to get started</p>
        </div>

        {submitted ? (
          <div className="text-green-700 text-center font-medium text-lg animate-pulse">
            🎉 Successfully submitted!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="relative">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder=" "
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg bg-white/70 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="absolute left-4 top-2 text-sm text-gray-600">Full Name</label>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder=" "
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg bg-white/70 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="absolute left-4 top-2 text-sm text-gray-600">Email Address</label>
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="relative">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder=" "
                className="w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg bg-white/70 text-gray-800 placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <label className="absolute left-4 top-2 text-sm text-gray-600">Password</label>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg text-lg font-semibold shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
