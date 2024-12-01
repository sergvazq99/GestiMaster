CREATE TABLE Accesibilidad (
    usuario_id INT PRIMARY KEY,
    paleta_colores VARCHAR(50),
    tamano_texto VARCHAR(20),
    configuracion_navegacion VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id)
);