-- Migration: Fix carbon_logs.energy_emission type mismatch
-- Purpose: Align existing PostgreSQL schema with JPA mapping (NUMERIC(10,2)).
-- Safe to run multiple times.

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'carbon_logs'
          AND column_name = 'energy_emission'
          AND data_type = 'double precision'
    ) THEN
        ALTER TABLE public.carbon_logs
            ALTER COLUMN energy_emission TYPE NUMERIC(10,2)
            USING ROUND(energy_emission::numeric, 2);
    END IF;
END $$;
