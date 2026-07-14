-- ============================================================
-- Test data - trader_tracker
-- 3 comptes de test : 1 admin, 1 user, 1 analyst
--
-- Mots de passe en clair pour les tests :
--   admin@trader-tracker.com    -> Admin123!
--   user@trader-tracker.com     -> User123!
--   analyst@trader-tracker.com  -> Analyst123!
--
-- Le compte analyst est créé avec analyst_verified = FALSE.
-- Dans un scénario réel, ce statut ne passe à TRUE qu'après que
-- l'analyste ait envoyé un document justificatif et qu'un admin
-- l'ait validé manuellement. Ce compte permet donc de tester ce
-- workflow de validation en plus des autres fonctionnalités.
-- ============================================================

USE trader_tracker;

INSERT INTO assets_types (id, asset_type) VALUES
    (1, 'Forex'),
    (2, 'Nasdaq'),
    (3, 'Comex');

INSERT INTO users
    (name, email, password, role, company, bio, analyst_verified, analyst_type_id, picture, document)
VALUES
    (
        'Seed Admin',
        'admin@trader-tracker.com',
        '$2b$12$rTVOz/9SaXMXXzhFw1/py.DCivS0lrzPOjjvUFhzQtj.bIsAS.0SW',
        'admin',
        NULL,
        NULL,
        FALSE,
        NULL,
        NULL,
        NULL
    ),
    (
        'Seed User',
        'user@trader-tracker.com',
        '$2b$12$zrq1bcQvcKoAtHWxa4XVI.DtPgt9uLbNU2niZmKL1N.24y6mV/fCK',
        'user',
        NULL,
        NULL,
        FALSE,
        NULL,
        NULL,
        NULL
    ),
    (
        'Seed Analyst',
        'analyst@trader-tracker.com',
        '$2b$12$ik.QWQiXHJCr4YSVQPw6duL5MTejUo5Hxu3.Mpr0r49sSXelH1zK6',
        'analyst',
        'Cabinet Claire Finance',
        'Analyste financière spécialisée sur les valeurs technologiques.',
        FALSE,
        NULL,
        NULL,
        NULL
    );