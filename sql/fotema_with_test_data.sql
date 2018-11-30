-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Nov 30, 2018 at 01:18 PM
-- Server version: 10.1.37-MariaDB
-- PHP Version: 7.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fotema`
--

-- --------------------------------------------------------

--
-- Table structure for table `ActionType`
--

CREATE TABLE `ActionType` (
  `id` int(11) NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ActionType`
--

INSERT INTO `ActionType` (`id`, `name`) VALUES
(1, 'like'),
(2, 'unlike'),
(3, 'login'),
(4, 'logout'),
(5, 'create'),
(6, 'update'),
(7, 'delete');

-- --------------------------------------------------------

--
-- Table structure for table `Comment`
--

CREATE TABLE `Comment` (
  `id` int(11) NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `target` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Comment`
--

INSERT INTO `Comment` (`id`, `text`, `target`) VALUES
(7, 'Nice image!', 1),
(8, 'Great!', 1),
(9, 'Fantastic!', 6),
(10, 'Nice!', 1);

-- --------------------------------------------------------

--
-- Table structure for table `Media`
--

CREATE TABLE `Media` (
  `id` int(11) NOT NULL,
  `path` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` int(11) NOT NULL,
  `thumbnail` int(11) DEFAULT NULL,
  `capturetime` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Media`
--

INSERT INTO `Media` (`id`, `path`, `title`, `description`, `type`, `thumbnail`, `capturetime`) VALUES
(1, '/path/to/media/1', 'Cute cat!', 'This is a cute cat!', 2, 2, '2018-11-14 00:00:00'),
(2, 'path/to/thumbs/1', '', '', 1, NULL, NULL),
(3, '/path/to/thumbs/2', '', '', 1, NULL, '2018-11-15 12:00:00'),
(4, 'path/to/thumbs/3', '', '', 1, NULL, '2018-11-22 00:00:00'),
(5, '/path/to/media/2', 'Nice dog!', 'This is a friendly dog!', 2, 3, '2018-11-23 00:00:00'),
(6, '/path/to/media/3', 'Funny video!', 'This is a funny video.', 4, 4, '2018-11-20 11:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `MediaType`
--

CREATE TABLE `MediaType` (
  `id` int(11) NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MediaType`
--

INSERT INTO `MediaType` (`id`, `name`) VALUES
(1, 'thumbnail'),
(2, 'image'),
(3, 'audio'),
(4, 'video');

-- --------------------------------------------------------

--
-- Table structure for table `Tag`
--

CREATE TABLE `Tag` (
  `id` int(11) NOT NULL,
  `name` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Tag`
--

INSERT INTO `Tag` (`id`, `name`) VALUES
(1, 'animals'),
(2, 'cats'),
(3, 'dogs'),
(4, 'nature'),
(5, 'fun');

-- --------------------------------------------------------

--
-- Table structure for table `Tagged`
--

CREATE TABLE `Tagged` (
  `mediaid` int(11) NOT NULL,
  `tagid` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Tagged`
--

INSERT INTO `Tagged` (`mediaid`, `tagid`) VALUES
(1, 1),
(1, 2),
(5, 1),
(5, 3),
(6, 5);

-- --------------------------------------------------------

--
-- Table structure for table `Target`
--

CREATE TABLE `Target` (
  `id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Target`
--

INSERT INTO `Target` (`id`) VALUES
(1),
(2),
(3),
(4),
(5),
(6),
(7),
(8),
(9),
(10);

-- --------------------------------------------------------

--
-- Table structure for table `UserAction`
--

CREATE TABLE `UserAction` (
  `id` int(11) NOT NULL,
  `actor` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `actiontype` int(11) NOT NULL,
  `target` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserAction`
--

INSERT INTO `UserAction` (`id`, `actor`, `time`, `actiontype`, `target`) VALUES
(6, 1, '2018-11-27 11:00:00', 3, NULL),
(7, 3, '2018-11-27 11:10:00', 3, NULL),
(8, 1, '2018-11-27 11:30:00', 5, 7),
(9, 1, '2018-11-27 11:31:00', 4, NULL),
(10, 3, '2018-11-27 12:00:00', 5, 8),
(11, 3, '2018-11-27 12:01:00', 1, 1),
(12, 5, '2018-11-27 14:00:00', 3, NULL),
(13, 5, '2018-11-27 14:03:00', 1, 1),
(14, 5, '2018-11-27 14:10:00', 5, 9),
(15, 5, '2018-11-27 15:00:00', 5, 10),
(16, 5, '2018-11-27 16:00:00', 1, 6),
(17, 5, '2018-11-27 16:01:00', 2, 6);

-- --------------------------------------------------------

--
-- Table structure for table `UserInfo`
--

CREATE TABLE `UserInfo` (
  `id` int(11) NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passhash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `profilepicture` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserInfo`
--

INSERT INTO `UserInfo` (`id`, `username`, `email`, `passhash`, `profilepicture`) VALUES
(1, 'user1', 'user1@domain.com', 'aiucuigfyuaegfyu', NULL),
(2, 'user2', 'user2@domain.com', 'bfacucfawftefused', NULL),
(3, 'user3', 'user3@domain.com', 'cyugdyuagyucfayufckuk', NULL),
(4, 'user4', 'user4@domain.com', 'dyugdyuagyucwfwfewe', NULL),
(5, 'user5', 'user5@domain.com', 'eyugdyuagyucfayjkdciud', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ActionType`
--
ALTER TABLE `ActionType`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Comment`
--
ALTER TABLE `Comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `target` (`target`);

--
-- Indexes for table `Media`
--
ALTER TABLE `Media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type` (`type`),
  ADD KEY `thumbnail` (`thumbnail`);

--
-- Indexes for table `MediaType`
--
ALTER TABLE `MediaType`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Tag`
--
ALTER TABLE `Tag`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Tagged`
--
ALTER TABLE `Tagged`
  ADD PRIMARY KEY (`mediaid`,`tagid`),
  ADD KEY `tagid` (`tagid`);

--
-- Indexes for table `Target`
--
ALTER TABLE `Target`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `UserAction`
--
ALTER TABLE `UserAction`
  ADD PRIMARY KEY (`id`),
  ADD KEY `actiontype` (`actiontype`),
  ADD KEY `actor` (`actor`),
  ADD KEY `target` (`target`);

--
-- Indexes for table `UserInfo`
--
ALTER TABLE `UserInfo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profilepicture` (`profilepicture`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ActionType`
--
ALTER TABLE `ActionType`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `MediaType`
--
ALTER TABLE `MediaType`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Tag`
--
ALTER TABLE `Tag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `Target`
--
ALTER TABLE `Target`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `UserAction`
--
ALTER TABLE `UserAction`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `UserInfo`
--
ALTER TABLE `UserInfo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Comment`
--
ALTER TABLE `Comment`
  ADD CONSTRAINT `Comment_ibfk_2` FOREIGN KEY (`id`) REFERENCES `Target` (`id`),
  ADD CONSTRAINT `Comment_ibfk_3` FOREIGN KEY (`target`) REFERENCES `Target` (`id`);

--
-- Constraints for table `Media`
--
ALTER TABLE `Media`
  ADD CONSTRAINT `Media_ibfk_2` FOREIGN KEY (`type`) REFERENCES `MediaType` (`id`),
  ADD CONSTRAINT `Media_ibfk_3` FOREIGN KEY (`thumbnail`) REFERENCES `Media` (`id`),
  ADD CONSTRAINT `Media_ibfk_4` FOREIGN KEY (`id`) REFERENCES `Target` (`id`);

--
-- Constraints for table `Tagged`
--
ALTER TABLE `Tagged`
  ADD CONSTRAINT `Tagged_ibfk_1` FOREIGN KEY (`mediaid`) REFERENCES `Media` (`id`),
  ADD CONSTRAINT `Tagged_ibfk_2` FOREIGN KEY (`tagid`) REFERENCES `Tag` (`id`);

--
-- Constraints for table `UserAction`
--
ALTER TABLE `UserAction`
  ADD CONSTRAINT `UserAction_ibfk_2` FOREIGN KEY (`actiontype`) REFERENCES `ActionType` (`id`),
  ADD CONSTRAINT `UserAction_ibfk_4` FOREIGN KEY (`actor`) REFERENCES `UserInfo` (`id`),
  ADD CONSTRAINT `UserAction_ibfk_5` FOREIGN KEY (`target`) REFERENCES `Target` (`id`);

--
-- Constraints for table `UserInfo`
--
ALTER TABLE `UserInfo`
  ADD CONSTRAINT `UserInfo_ibfk_1` FOREIGN KEY (`profilepicture`) REFERENCES `Media` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
