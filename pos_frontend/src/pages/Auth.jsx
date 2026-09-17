import React, { useEffect, useState } from "react";
import logo from "../assets/images/logo-modified.png";
import restaurant from "../assets/images/restaurant-img.jpg";
import Register from "../components/auth/Register";
import Login from "../components/auth/Login";
const Auth = () => {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-[#1a1a1a]">
      {/* Left Section - Hidden on mobile, visible on desktop */}
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center bg-cover overflow-hidden">
        {/* BG Image */}
        <img
          className="w-full h-full object-cover opacity-35 z-10"
          src={restaurant}
          alt="Restaurant Image"
        />

        {/* Black Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-80"></div>

        {/* Quote at bottom */}
        <blockquote className="absolute bottom-10 px-8 mb-10 text-xl lg:text-2xl italic text-white z-20">
          "Serve customers the best food with prompt and friendly service in a
          welcoming atmosphere, and they’ll keep coming back."
          <br />
          <span className="block mt-4 text-yellow-400 font-semibold">- Our Vision</span>
        </blockquote>
      </div>

      {/* Right Section - Full width on mobile */}
      <div className="w-full md:w-1/2 min-h-screen overflow-y-auto bg-[#1a1a1a] p-6 sm:p-10 flex flex-col justify-center">
        <div className="max-w-md w-full mx-auto my-auto">
          <div className="flex flex-col items-center gap-2">
            <img
              src={logo}
              alt="Restro Logo"
              className="h-12 w-12 sm:h-14 sm:w-14 border-2 rounded-full p-1"
            />
            <h1 className="text-base sm:text-lg font-semibold text-[#f5f5f5] tracking-wide">
              Jayanthi Hotel
            </h1>
          </div>

          <h2 className="text-2xl sm:text-4xl text-center mt-6 sm:mt-10 font-semibold text-yellow-400 mb-6 sm:mb-10">
            {isRegister ? "Employee Registration" : "Employee Login"}
          </h2>

          {/* Components */}
          {isRegister ? <Register setIsRegister={setIsRegister} /> : <Login />}

          <div className="flex justify-center mt-6">
            <p className="text-sm text-[#ababab]">
              {isRegister ? "Already have an account?" : "Don't have an account?"}
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setIsRegister(!isRegister);
                }}
                className="text-yellow-400 font-semibold hover:underline cursor-pointer ml-1"
                href="#"
              >
                {isRegister ? "Sign in" : "Sign up"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
