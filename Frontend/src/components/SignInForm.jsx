import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SignInForm = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isSignUp ? "Signing up..." : "Signing in...");
    console.log("Email:", email);
    console.log("Password:", password);
           // Store token & user data
           localStorage.setItem("token", res.data.token);
           localStorage.setItem("user", JSON.stringify(res.data.user));
     
           // Clear the modal on successful login/signup
           onClose();
  };

  // Handle Esc key press to close the modal
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <motion.div
      initial={{ x: "100%" }} // Start off-screen
      animate={{ x: isOpen ? "0%" : "100%" }} // Animate in and out
      exit={{ x: "100%" }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-0 right-0 h-full w-[350px] bg-gray-900 text-white p-6 shadow-lg"
    >
      <button className="absolute top-4 right-4 text-xl" onClick={onClose}>
        ✖
      </button>
      <form onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <p className="text-sm text-gray-500">
          or{" "}
          <span
            className="text-orange-600 font-medium cursor-pointer"
            onClick={() => setIsSignUp((prev) => !prev)}
          >
            {isSignUp ? "Already have an account?" : "Create an account"}
          </span>
        </p>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-3 bg-gray-700 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full p-2 bg-blue-500 hover:bg-blue-600">
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>
    </motion.div>
  );
};

export default SignInForm;
