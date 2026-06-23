import { useState } from "react";
import { Link } from "react-router-dom";

function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <Link className="logo" to="/">FS-0003</Link>

      <button className="menu" onClick={() => setOpen(!open)}>
        Menu
      </button>

      <nav className={open ? "nav navOpen" : "nav"}>
        <Link to="/">Inicio</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
    </header>
  );
}

export default Header;
