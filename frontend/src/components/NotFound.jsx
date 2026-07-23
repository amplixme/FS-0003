import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <main className="notFoundPage">
      <section className="notFoundCard" aria-labelledby="notfound-title">
        <p className="notFoundEyebrow">404</p>
        <h1 id="notfound-title">Página no encontrada</h1>
        <p>La ruta que intentaste abrir no existe o fue movida.</p>
        <Link to="/" className="notFoundLink">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
};

export default NotFound;
