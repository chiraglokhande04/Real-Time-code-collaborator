import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import SignInForm from "../components/SignInForm";

const LandingPage = () => {

  const [isSignInOpen, setIsSignInOpen] = useState(false);


  return (
    <div className="flex flex-col justify-center items-center gap-10 p-4 dark:bg-gray-800 h-screen text-white">
      <div className="flex items-center gap-4">
        <img
          className="w-20 h-20"
          src="https://st2.depositphotos.com/2904097/6823/v/950/depositphotos_68236717-stock-illustration-vector-code-editor-icon.jpg"
          alt="Code Editor Icon"
        />
        <span className="text-2xl font-bold">Coddy</span>
      </div>
      <div className="font-semibold text-2xl">
        <ul className="flex gap-8 text-center">
          <li className="rounded-xl bg-red-300 p-4 w-44">
            <NavLink to="/createroom" >
              Create / Join Room
            </NavLink>
          </li>
          {/* <li className="rounded-xl bg-red-300 p-4 w-44">
            <NavLink to="/joinroom">
              Join Room
            </NavLink>
          </li> */}
          <li className="rounded-xl bg-red-300 p-4 w-44">
            <button onClick={() => setIsSignInOpen(true)}>Sign In</button>
          </li>
        </ul>
      </div>
      {isSignInOpen && <SignInForm isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />}
    </div>
  );
};

export default LandingPage;
