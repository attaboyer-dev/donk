TRUNCATE tables CASCADE;
TRUNCATE games CASCADE;

INSERT INTO tables (id, name, sb_size, bb_size, min_buy_in, max_buy_in, game_type)
VALUES (1, 'Testing Table 3', 10, 20, 500, 2000, 'NLHE');

INSERT INTO games (id, table_id)
VALUES (1, 1);