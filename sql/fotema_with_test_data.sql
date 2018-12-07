-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 07, 2018 at 04:25 PM
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
-- Table structure for table `Comment`
--

CREATE TABLE `Comment` (
  `id` int(11) NOT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `targetmedia` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  `time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Comment`
--

INSERT INTO `Comment` (`id`, `text`, `targetmedia`, `user`, `time`) VALUES
(7, 'Nice image!', 1, 1, '2018-11-20 12:00:00'),
(8, 'Great!', 1, 3, '2018-11-20 14:00:00'),
(9, 'Fantastic!', 6, 1, '2018-11-23 12:00:00'),
(10, 'Nice!', 1, 5, '2018-11-25 15:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `CommentLike`
--

CREATE TABLE `CommentLike` (
  `user` int(11) NOT NULL,
  `comment` int(11) NOT NULL,
  `time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CommentLike`
--

INSERT INTO `CommentLike` (`user`, `comment`, `time`) VALUES
(2, 9, '2018-12-25 12:00:00');

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
  `capturetime` datetime DEFAULT NULL,
  `uploadtime` datetime NOT NULL,
  `user` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `Media`
--

INSERT INTO `Media` (`id`, `path`, `title`, `description`, `type`, `thumbnail`, `capturetime`, `uploadtime`, `user`) VALUES
(1, '/path/to/media/1', 'Cute cat!', 'This is a cute cat!', 2, 2, '2018-11-14 00:00:00', '2018-11-15 00:00:00', 1),
(2, 'path/to/thumbs/1', '', '', 1, NULL, '2018-11-14 00:00:00', '2018-11-15 00:00:00', 1),
(3, '/path/to/thumbs/2', '', '', 1, NULL, '2018-11-15 12:00:00', '2018-11-16 00:00:00', 3),
(4, 'path/to/thumbs/3', '', '', 1, NULL, '2018-11-20 11:00:00', '2018-11-21 00:00:00', 4),
(5, '/path/to/media/2', 'Nice dog!', 'This is a friendly dog!', 2, 3, '2018-11-15 00:00:00', '2018-11-16 00:00:00', 3),
(6, '/path/to/media/3', 'Funny video!', 'This is a funny video.', 4, 4, '2018-11-20 11:00:00', '2018-11-21 00:00:00', 4),
(9, '/test/thumb/2', 'Test 3', 'Added by node.js', 1, NULL, '2018-11-21 00:00:00', '2018-11-22 02:00:00', 2),
(10, '/test/2', 'Test 3', 'Added by node.js', 2, 9, '2018-11-21 00:00:00', '2018-11-22 02:00:00', 2);

-- --------------------------------------------------------

--
-- Table structure for table `MediaLike`
--

CREATE TABLE `MediaLike` (
  `user` int(11) NOT NULL,
  `media` int(11) NOT NULL,
  `time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `MediaLike`
--

INSERT INTO `MediaLike` (`user`, `media`, `time`) VALUES
(1, 1, '2018-12-20 12:00:00'),
(3, 1, '2018-12-20 13:00:00'),
(5, 6, '2018-12-23 12:00:00'),
(5, 5, '2018-12-26 00:00:00');

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
(5, 'fun'),
(6, 'fur'),
(7, 'play');

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
(6, 5),
(10, 2),
(10, 6),
(10, 7);

-- --------------------------------------------------------

--
-- Table structure for table `UserInfo`
--

CREATE TABLE `UserInfo` (
  `id` int(11) NOT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `passhash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `salt` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int(11) NOT NULL,
  `profilepicture` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `UserInfo`
--

INSERT INTO `UserInfo` (`id`, `username`, `email`, `passhash`, `salt`, `level`, `profilepicture`) VALUES
(1, 'user1', 'user1@domain.com', 'aiucuigfyuaegfyu', 'vsgtsgt', 3, NULL),
(2, 'user2', 'user2@domain.com', 'bfacucfawftefused', 'wegegrge', 2, NULL),
(3, 'user3', 'user3@domain.com', 'cyugdyuagyucfayufckuk', 'wergerg', 1, NULL),
(4, 'user4', 'user4@domain.com', 'dyugdyuagyucwfwfewe', 'fdgdfgdf', 1, NULL),
(5, 'user5', 'user5@domain.com', 'eyugdyuagyucfayjkdciud', 'ersfdgdfg', 1, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Comment`
--
ALTER TABLE `Comment`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user` (`user`),
  ADD KEY `targetmedia` (`targetmedia`);

--
-- Indexes for table `CommentLike`
--
ALTER TABLE `CommentLike`
  ADD KEY `user` (`user`),
  ADD KEY `comment` (`comment`);

--
-- Indexes for table `Media`
--
ALTER TABLE `Media`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type` (`type`),
  ADD KEY `user` (`user`),
  ADD KEY `thumbnail` (`thumbnail`);

--
-- Indexes for table `MediaLike`
--
ALTER TABLE `MediaLike`
  ADD KEY `user` (`user`),
  ADD KEY `media` (`media`);

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
-- Indexes for table `UserInfo`
--
ALTER TABLE `UserInfo`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profilepicture` (`profilepicture`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Comment`
--
ALTER TABLE `Comment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `Media`
--
ALTER TABLE `Media`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `MediaType`
--
ALTER TABLE `MediaType`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Tag`
--
ALTER TABLE `Tag`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  ADD CONSTRAINT `Comment_ibfk_2` FOREIGN KEY (`user`) REFERENCES `UserInfo` (`id`),
  ADD CONSTRAINT `Comment_ibfk_3` FOREIGN KEY (`targetmedia`) REFERENCES `Media` (`id`);

--
-- Constraints for table `CommentLike`
--
ALTER TABLE `CommentLike`
  ADD CONSTRAINT `CommentLike_ibfk_1` FOREIGN KEY (`user`) REFERENCES `UserInfo` (`id`),
  ADD CONSTRAINT `CommentLike_ibfk_2` FOREIGN KEY (`comment`) REFERENCES `Comment` (`id`);

--
-- Constraints for table `Media`
--
ALTER TABLE `Media`
  ADD CONSTRAINT `Media_ibfk_2` FOREIGN KEY (`type`) REFERENCES `MediaType` (`id`),
  ADD CONSTRAINT `Media_ibfk_5` FOREIGN KEY (`user`) REFERENCES `UserInfo` (`id`),
  ADD CONSTRAINT `Media_ibfk_6` FOREIGN KEY (`thumbnail`) REFERENCES `Media` (`id`);

--
-- Constraints for table `MediaLike`
--
ALTER TABLE `MediaLike`
  ADD CONSTRAINT `MediaLike_ibfk_1` FOREIGN KEY (`user`) REFERENCES `UserInfo` (`id`),
  ADD CONSTRAINT `MediaLike_ibfk_2` FOREIGN KEY (`media`) REFERENCES `Media` (`id`);

--
-- Constraints for table `Tagged`
--
ALTER TABLE `Tagged`
  ADD CONSTRAINT `Tagged_ibfk_2` FOREIGN KEY (`tagid`) REFERENCES `Tag` (`id`),
  ADD CONSTRAINT `Tagged_ibfk_3` FOREIGN KEY (`mediaid`) REFERENCES `Media` (`id`);

--
-- Constraints for table `UserInfo`
--
ALTER TABLE `UserInfo`
  ADD CONSTRAINT `UserInfo_ibfk_1` FOREIGN KEY (`profilepicture`) REFERENCES `Media` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
