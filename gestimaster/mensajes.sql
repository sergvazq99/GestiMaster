CREATE TABLE mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    mensaje TEXT NOT NULL,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usuarios(id)
);