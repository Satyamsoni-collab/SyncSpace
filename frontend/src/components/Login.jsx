import React, { useState } from "react";

function Login({
  onSwitchToRegister,
  onLoginSuccess
}) {

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleSubmit =
    async (event) => {

      event.preventDefault();

      setMessage("");
      setLoading(true);


      try {

        const response =
          await fetch(
            "http://localhost:5000/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                email,
                password
              })
            }
          );


        const data =
          await response.json();


        if (!response.ok) {

          setMessage(
            data.message ||
            "Login failed"
          );

          setLoading(false);

          return;

        }


        localStorage.setItem(
          "syncspaceToken",
          data.token
        );


        localStorage.setItem(
          "syncspaceUser",
          JSON.stringify(
            data.user
          )
        );


        setMessage(
          "Login successful!"
        );


        setTimeout(() => {

          onLoginSuccess(
            data.user
          );

        }, 500);


      } catch (error) {

        console.error(error);

        setMessage(
          "Unable to connect to server"
        );

      }


      setLoading(false);

    };


  return (

    <div className="auth-container">

      <div className="auth-card">


        <h1>
          Welcome Back
        </h1>


        <p>
          Login to continue to SyncSpace.
        </p>


        <form
          onSubmit={handleSubmit}
        >


          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) =>
              setEmail(
                event.target.value
              )
            }
            required
          />


          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            required
          />


          <button
            type="submit"
            disabled={loading}
          >

            {
              loading
                ? "Logging in..."
                : "Login"
            }

          </button>


        </form>


        {
          message && (

            <p className="auth-message">

              {message}

            </p>

          )
        }


        <p>

          Don't have an account?

          {" "}

          <button
            type="button"
            onClick={
              onSwitchToRegister
            }
          >

            Register

          </button>

        </p>


      </div>

    </div>

  );

}


export default Login;