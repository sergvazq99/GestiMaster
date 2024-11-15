CREATE TABLE Eventos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    capacidad_maxima INT NOT NULL,
    organizador_id INT NOT NULL,
    FOREIGN KEY (organizador_id) REFERENCES Usuarios(id)
);