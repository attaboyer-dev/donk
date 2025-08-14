This workspace is responsible for any interactions with the database-layer, which is currently Postgres.

This repo should be entirely self reliant, and not have dependencies around other workspaces. This is to ensure there are no dependencies cycles. Types defined here should be structured and formatted common database standards.

Responsibilities include management of the DB, schema, migrations, CRUD operations on tables, and the like.
