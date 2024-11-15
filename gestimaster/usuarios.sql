CREATE TABLE Usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    facultad VARCHAR(255),
    rol ENUM('organizador', 'asistente') NOT NULL,
    contrasenia VARCHAR(20),
    FOREIGN KEY (facultad) REFERENCES Facultades(nombre)
);