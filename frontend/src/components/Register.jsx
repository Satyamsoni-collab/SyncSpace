import React, { useState } from "react";

function Register({ onSwitchToLogin }) {

  const [name, setName] =
    useState("");

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
            "http://localhost:5000/api/auth/register",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body: JSON.stringify({
                name,
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
            "Registration failed"
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
          JSON.stringify({
            name,
            email
          })
        );


        setMessage(
          "Registration successful!"
        );


        setTimeout(() => {

          onSwitchToLogin();

        }, 1000);


      } catch (error) {

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
          Create Account
        </h1>

        <p>
          Join SyncSpace and start collaborating.
        </p>


        <form
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            required
          />


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
                ? "Creating Account..."
                : "Create Account"
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

          Already have an account?

          {" "}

          <button
            type="button"
            onClick={
              onSwitchToLogin
            }
          >

            Login

          </button>

        </p>


      </div>

    </div>

  );

}


export default Register;