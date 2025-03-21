import React from 'react';
import { useParams } from 'react-router-dom';

const PlayerDetail = () => {
  const { id } = useParams();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Detalles del Jugador</h1>
      <p>ID del jugador: {id}</p>
      {/* Aquí irá el contenido detallado del jugador */}
    </div>
  );
};

export default PlayerDetail; 