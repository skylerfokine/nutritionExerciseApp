import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from "./components/navbar";
import Register from "./components/register";
import Login from "./components/login";

function App() {
  const [page, setPage] = useState("home"); //makes it so first page loaded is the home page

  return (
    <>
      <Navbar />
      <Navbar setPage={setPage} />
      <div style={{ paddingTop: "60px" }}>
        {page === "home" && <h1>Welcome to the site</h1>}
        {page === "register" && <Register />}
        {page === "login" && <Login />}
      </div>
    </>
  )
}

export default App
