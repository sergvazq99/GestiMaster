-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 15-11-2024 a las 13:44:04
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `aw_24`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `accesibilidad`
--

CREATE TABLE `accesibilidad` (
  `usuario_id` int(11) NOT NULL,
  `paleta_colores` varchar(50) DEFAULT NULL,
  `tamano_texto` varchar(20) DEFAULT NULL,
  `configuracion_navegacion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eventos`
--

CREATE TABLE `eventos` (
  `id` int(11) NOT NULL,
  `titulo` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `ubicacion` varchar(255) NOT NULL,
  `capacidad_maxima` int(11) NOT NULL,
  `organizador_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descripcion`, `fecha`, `hora`, `ubicacion`, `capacidad_maxima`, `organizador_id`) VALUES
(3, 'DANA', 'jnvjrnvrgvr', '2024-11-29', '06:04:00', 'Facultad de Matemáticas', 33, 5),
(4, 'Torneo', 'un torneo para ganar 1 crédito', '2024-11-16', '16:52:00', 'Facultad de Geología', 350, 5),
(5, 'Torneo', 'ythyttny', '2024-11-16', '17:53:00', 'Facultad de Historia', 350, 5),
(6, 'Torneo', 'bynyny', '2024-11-16', '17:54:00', 'Facultad de Historia', 350, 5),
(7, 'Torneo', 'ujyujnuuy', '2024-11-16', '16:55:00', 'Facultad de Filosofía', 350, 5),
(8, 'hola', 'holaadios', '2024-11-16', '17:14:00', 'Facultad de Matemáticas', 33, 5),
(9, 'DANA', '', '0000-00-00', '00:00:00', 'Elegir...', 33, 5);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `facultades`
--

CREATE TABLE `facultades` (
  `nombre` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `facultades`
--

INSERT INTO `facultades` (`nombre`) VALUES
('Facultad de Arquitectura'),
('Facultad de Bellas Artes'),
('Facultad de Biología'),
('Facultad de Ciencias Políticas'),
('Facultad de Derecho'),
('Facultad de Farmacia'),
('Facultad de Filosofía'),
('Facultad de Físicas'),
('Facultad de Geología'),
('Facultad de Historia'),
('Facultad de Informática'),
('Facultad de Matemáticas'),
('Facultad de Medicina'),
('Facultad de Química');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inscripciones`
--

CREATE TABLE `inscripciones` (
  `usuario_id` int(11) NOT NULL,
  `evento_id` int(11) NOT NULL,
  `estado_inscripcion` enum('inscrito','lista de espera') NOT NULL,
  `fecha_inscripcion` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `sessions`
--

INSERT INTO `sessions` (`session_id`, `expires`, `data`) VALUES
('fC9kf1fZlXOxCxsRaaG6Z_WDFT0hvS46', 1731761004, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"userId\":5,\"nombre\":\"diego\",\"correo\":\"diego@ucm.es\",\"telefono\":\"913572715\",\"facultad\":\"Facultad de Informática\",\"contrasenia\":\"diegamen123\",\"rol\":\"organizador\"}'),
('xCbj8fDcfP-KZyvS94TIrNNoyaTCfBOE', 1731719058, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"userId\":5,\"nombre\":\"diego\",\"rol\":\"organizador\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `correo` varchar(100) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `facultad` varchar(255) DEFAULT NULL,
  `rol` enum('organizador','asistente') NOT NULL,
  `contrasenia` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `telefono`, `facultad`, `rol`, `contrasenia`) VALUES
(1, 'Sergio', 'sergvazq@ucm.es', '913572715', 'Facultad de Informática', 'asistente', NULL),
(2, 'Javier', 'javier@ucm.es', '913572715', 'Facultad de Química', 'asistente', NULL),
(3, 'Eduardo', 'edu@ucm.es', '691623394', 'Facultad de Informática', 'organizador', NULL),
(4, 'Esteban', 'esteban@ucm.es', '123456789', 'Facultad de Farmacia', 'organizador', NULL),
(5, 'diego', 'diego@ucm.es', '913572715', 'Facultad de Informática', 'organizador', 'diegamen123'),
(6, 'angel', 'angel@ucm.es', '647823451', 'Facultad de Farmacia', 'asistente', 'angel123'),
(7, 'anibal', 'anibal@ucm.es', '913572715', 'Facultad de Físicas', 'asistente', 'anibal123'),
(8, 'alba', 'alba@ucm.es', '913572715', 'Facultad de Farmacia', 'organizador', 'alba123');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `accesibilidad`
--
ALTER TABLE `accesibilidad`
  ADD PRIMARY KEY (`usuario_id`);

--
-- Indices de la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `organizador_id` (`organizador_id`);

--
-- Indices de la tabla `facultades`
--
ALTER TABLE `facultades`
  ADD PRIMARY KEY (`nombre`);

--
-- Indices de la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD PRIMARY KEY (`usuario_id`,`evento_id`),
  ADD KEY `evento_id` (`evento_id`);

--
-- Indices de la tabla `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `facultad` (`facultad`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `eventos`
--
ALTER TABLE `eventos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `accesibilidad`
--
ALTER TABLE `accesibilidad`
  ADD CONSTRAINT `accesibilidad_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `eventos`
--
ALTER TABLE `eventos`
  ADD CONSTRAINT `eventos_ibfk_1` FOREIGN KEY (`organizador_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `inscripciones`
--
ALTER TABLE `inscripciones`
  ADD CONSTRAINT `inscripciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `inscripciones_ibfk_2` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`facultad`) REFERENCES `facultades` (`nombre`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
