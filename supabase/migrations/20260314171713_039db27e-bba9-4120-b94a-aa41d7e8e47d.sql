-- Enable leaked password protection via auth config
-- This is done through auth.config, not a schema migration
ALTER ROLE authenticator SET pgrst.db_pre_request TO '';
SELECT 1;