CREATE TABLE Inscripciones (
    usuario_id INT NOT NULL,
    evento_id INT NOT NULL,
    estado_inscripcion ENUM('inscrito', 'lista de espera') NOT NULL,
    fecha_inscripcion DATE NOT NULL,
    tipo_inscripcion VARCHAR(20) NOT NULL,
    PRIMARY KEY (usuario_id, evento_id),
    FOREIGN KEY (usuario_id) REFERENCES Usuarios(id),
    FOREIGN KEY (evento_id) REFERENCES Eventos(id)
);