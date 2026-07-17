-- ─────────────────────────────────────────────────────────────
-- counseling_sessions テーブルの作り直し
--
-- 目的：個人を特定する情報を保存しない構造へ変更する
--   削除：氏名・ふりがな・生年月日・職業・住所・電話・携帯
--         服薬情報（有無・詳細）・既往（有無・詳細）
--         自由記述（食事メモ・ご要望）
--   追加：managementNo（サロン側の管理番号）／ageGroup（年代）
--
-- ※ 既存データは不要との確認済みのため、DROP して作り直します。
-- ─────────────────────────────────────────────────────────────

DROP TABLE IF EXISTS `counseling_sessions`;

CREATE TABLE `counseling_sessions` (
  `id` int AUTO_INCREMENT NOT NULL,
  `managementNo` varchar(64),
  `ageGroup` varchar(16),
  `ectoScore` int NOT NULL DEFAULT 0,
  `mesoScore` int NOT NULL DEFAULT 0,
  `endoScore` int NOT NULL DEFAULT 0,
  `primaryType` enum('ecto','meso','endo','unknown') NOT NULL DEFAULT 'unknown',
  `ectoChecked` json,
  `mesoChecked` json,
  `endoChecked` json,
  `symptoms` json,
  `hairChildType` varchar(50),
  `hairTroubles` json,
  `colorHistory` varchar(500),
  `hasPollen` boolean DEFAULT false,
  `pollenTypes` json,
  `lifestyleHabits` json,
  `visitReason` varchar(100),
  `accessChannel` enum('store','sns','line','web','public','other') NOT NULL DEFAULT 'other',
  `partnerSalonId` int,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  CONSTRAINT `counseling_sessions_id` PRIMARY KEY(`id`)
);
