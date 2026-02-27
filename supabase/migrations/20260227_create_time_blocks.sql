-- Time blocks table for 15-minute interval logging
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_slot TEXT NOT NULL,        -- "05:00", "05:15", etc. (HH:MM 24h)
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- One entry per date+time_slot
ALTER TABLE time_blocks
ADD CONSTRAINT uq_time_blocks_date_slot UNIQUE (block_date, time_slot);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_time_blocks_date ON time_blocks(block_date);

-- Comments for documentation
COMMENT ON TABLE time_blocks IS '15-minute time blocks for daily activity logging';
COMMENT ON COLUMN time_blocks.time_slot IS 'Time in HH:MM 24h format (e.g. 05:00, 05:15, 01:45)';
COMMENT ON COLUMN time_blocks.block_date IS 'The date this block belongs to';
