Backend Core

Backend core is used to isolate core backend functionality that can reasonably extrapolated to multiple API servers
or other backend operations. An example would be common middleware, ApplicationContext, and individual services.

It also helps bridge the gap between types in "shared", which should be universally used, and "database", which
is tighly coupled to Postgres structure and not relevant outside of that context.
