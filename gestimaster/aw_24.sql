-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 26-11-2024 a las 20:03:50
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
  `organizador_id` int(11) NOT NULL,
  `tipo` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `eventos`
--

INSERT INTO `eventos` (`id`, `titulo`, `descripcion`, `fecha`, `hora`, `ubicacion`, `capacidad_maxima`, `organizador_id`, `tipo`) VALUES
(3, 'DANA', 'jnvjrnvrgvr', '2024-11-29', '06:04:00', 'Facultad de Matemáticas', 33, 5, ''),
(4, 'Torneo', 'un torneo para ganar 1 crédito', '2024-11-16', '16:52:00', 'Facultad de Geología', 350, 5, ''),
(5, 'Torneo', 'ythyttny', '2024-11-16', '17:53:00', 'Facultad de Historia', 350, 5, ''),
(6, 'Torneo', 'bynyny', '2024-11-16', '17:54:00', 'Facultad de Historia', 350, 5, ''),
(7, 'Torneo', 'ujyujnuuy', '2024-11-16', '16:55:00', 'Facultad de Filosofía', 350, 5, ''),
(8, 'hola', 'holaadios', '2024-11-16', '17:14:00', 'Facultad de Matemáticas', 33, 5, ''),
(9, 'DANA', '', '0000-00-00', '00:00:00', 'Elegir...', 33, 5, ''),
(10, 'EVENTOALBA', 'hola soy alba', '2024-11-28', '23:18:00', 'Facultad de Informática', 22, 8, ''),
(15, 'taller de datos', 'eeeeeeee', '2024-11-23', '17:46:00', 'Facultad de Geología', 33, 5, 'taller');

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

--
-- Volcado de datos para la tabla `inscripciones`
--

INSERT INTO `inscripciones` (`usuario_id`, `evento_id`, `estado_inscripcion`, `fecha_inscripcion`) VALUES
(6, 8, '', '0000-00-00'),
(7, 3, 'lista de espera', '0000-00-00'),
(7, 4, '', '0000-00-00'),
(7, 5, 'lista de espera', '0000-00-00'),
(7, 6, 'lista de espera', '0000-00-00'),
(7, 7, 'lista de espera', '2024-11-22'),
(7, 8, 'lista de espera', '2024-11-22'),
(7, 9, 'lista de espera', '0000-00-00'),
(7, 15, 'lista de espera', '2024-11-22');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `user_id`, `mensaje`, `creado_en`) VALUES
(1, 5, 'Torneo', '2024-11-19 18:35:51'),
(2, 5, 'Torneo', '2024-11-19 18:36:10'),
(3, 5, 'DANA', '2024-11-19 18:43:47'),
(4, 5, 'Torneo', '2024-11-19 18:44:16'),
(5, 5, 'DANA', '2024-11-19 18:44:33'),
(6, 5, 'Un nuevo asistente se ha inscrito en tu evento DANA', '2024-11-19 18:48:02'),
(7, 5, 'Un nuevo asistente se ha inscrito en tu evento Torneo', '2024-11-19 18:49:04'),
(8, 5, 'Un nuevo asistente se ha inscrito en tu evento DANA', '2024-11-19 18:54:14'),
(9, 5, 'Un nuevo asistente se ha inscrito en tu evento ``$titulo', '2024-11-19 19:04:20'),
(10, 5, 'Un nuevo asistente se ha inscrito en tu evento \"Torneo\"', '2024-11-19 19:07:09'),
(11, 8, 'Un nuevo asistente se ha inscrito en tu evento \"EVENTOALBA\"', '2024-11-19 19:19:34'),
(12, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 10:52:28'),
(13, 5, 'Un nuevo asistente se ha inscrito en tu evento \"hola\"', '2024-11-22 18:05:01'),
(14, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:16:07'),
(15, 5, 'Un nuevo asistente se ha inscrito en tu evento \"Torneo\"', '2024-11-22 18:16:31'),
(16, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:19:24'),
(17, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:39:45'),
(18, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:47:31'),
(19, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:47:57'),
(20, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:52:10'),
(21, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:55:04'),
(22, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 18:58:28'),
(23, 5, 'Un nuevo asistente se ha inscrito en tu evento \"taller de datos\"', '2024-11-22 19:06:29');

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
('-k7INVfgNqkr_seJduBrp6_c4MXexve4', 1732388805, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"userId\":7,\"nombre\":\"anibal\",\"correo\":\"anibal@ucm.es\",\"telefono\":\"913572715\",\"facultad\":\"Facultad de Físicas\",\"contrasenia\":\"anibal123\",\"rol\":\"asistente\"}'),
('KkzYQUVg9_sr6Yh4FKuLRAmpc-6L4HZu', 1732305102, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"userId\":5,\"nombre\":\"diego\",\"correo\":\"diego@ucm.es\",\"telefono\":\"913572715\",\"facultad\":\"Facultad de Informática\",\"contrasenia\":\"diegamen123\",\"rol\":\"organizador\"}'),
('LJGpB5Mtk4PSLlvcmZf8oFcdqyUZAT4l', 1732734086, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"userId\":7,\"nombre\":\"anibal\",\"correo\":\"anibal@ucm.es\",\"telefono\":\"913572715\",\"facultad\":\"Facultad de Físicas\",\"contrasenia\":\"anibal123\",\"rol\":\"asistente\"}'),
('cqPYdONOWsW-NClFEdarJ2WbhUfmejyF', 1732365413, '{\"cookie\":{\"originalMaxAge\":null,\"expires\":null,\"httpOnly\":true,\"path\":\"/\"},\"userId\":5,\"nombre\":\"dieguillo\",\"correo\":\"dieguillo@ucm.es\",\"telefono\":\"913572715\",\"facultad\":\"Facultad de Geología\",\"contrasenia\":\"dieguillo123\",\"rol\":\"organizador\"}');

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
(5, 'dieguillo', 'dieguillo@ucm.es', '913572715', 'Facultad de Geología', 'organizador', 'dieguillo123'),
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
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

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
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`facultad`) REFERENCES `facultades` (`nombre`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
