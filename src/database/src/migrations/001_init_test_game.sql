TRUNCATE tables CASCADE;
TRUNCATE games CASCADE;

INSERT INTO tables (id, name, sb_size, bb_size, min_buy_in, max_buy_in, game_type)
VALUES (1, 'Testing Table 3', 0.1, 0.2, 5, 20, 'NLHE');

INSERT INTO games (id, table_id)
VALUES (1, 1);