-- =============================================
-- FIFA World Cup 2026 — 48 Teams Seed
-- Groups A-L (4 teams each) — approximate seeding
-- Final draw determines exact groups
-- =============================================

INSERT INTO public.teams (name, code, flag_emoji, group_code, confederation) VALUES
-- Group A (USA host)
('Estados Unidos', 'USA', '🇺🇸', 'A', 'CONCACAF'),
('Portugal', 'POR', '🇵🇹', 'A', 'UEFA'),
('Uruguay', 'URU', '🇺🇾', 'A', 'CONMEBOL'),
('República Democrática del Congo', 'COD', '🇨🇩', 'A', 'CAF'),

-- Group B
('España', 'ESP', '🇪🇸', 'B', 'UEFA'),
('Argentina', 'ARG', '🇦🇷', 'B', 'CONMEBOL'),
('Marruecos', 'MAR', '🇲🇦', 'B', 'CAF'),
('Japón', 'JPN', '🇯🇵', 'B', 'AFC'),

-- Group C
('Francia', 'FRA', '🇫🇷', 'C', 'UEFA'),
('Brasil', 'BRA', '🇧🇷', 'C', 'CONMEBOL'),
('Nigeria', 'NGA', '🇳🇬', 'C', 'CAF'),
('Arabia Saudita', 'KSA', '🇸🇦', 'C', 'AFC'),

-- Group D
('Alemania', 'GER', '🇩🇪', 'D', 'UEFA'),
('Colombia', 'COL', '🇨🇴', 'D', 'CONMEBOL'),
('Senegal', 'SEN', '🇸🇳', 'D', 'CAF'),
('Corea del Sur', 'KOR', '🇰🇷', 'D', 'AFC'),

-- Group E (México host)
('México', 'MEX', '🇲🇽', 'E', 'CONCACAF'),
('Inglaterra', 'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'E', 'UEFA'),
('Ecuador', 'ECU', '🇪🇨', 'E', 'CONMEBOL'),
('Irán', 'IRN', '🇮🇷', 'E', 'AFC'),

-- Group F (Canadá host)
('Canadá', 'CAN', '🇨🇦', 'F', 'CONCACAF'),
('Países Bajos', 'NED', '🇳🇱', 'F', 'UEFA'),
('Costa de Marfil', 'CIV', '🇨🇮', 'F', 'CAF'),
('Australia', 'AUS', '🇦🇺', 'F', 'AFC'),

-- Group G
('Bélgica', 'BEL', '🇧🇪', 'G', 'UEFA'),
('Chile', 'CHI', '🇨🇱', 'G', 'CONMEBOL'),
('Egipto', 'EGY', '🇪🇬', 'G', 'CAF'),
('Iraq', 'IRQ', '🇮🇶', 'G', 'AFC'),

-- Group H
('Croacia', 'CRO', '🇭🇷', 'H', 'UEFA'),
('Paraguay', 'PAR', '🇵🇾', 'H', 'CONMEBOL'),
('Argelia', 'ALG', '🇩🇿', 'H', 'CAF'),
('Uzbekistán', 'UZB', '🇺🇿', 'H', 'AFC'),

-- Group I
('Italia', 'ITA', '🇮🇹', 'I', 'UEFA'),
('Bolivia', 'BOL', '🇧🇴', 'I', 'CONMEBOL'),
('Ghana', 'GHA', '🇬🇭', 'I', 'CAF'),
('Panamá', 'PAN', '🇵🇦', 'I', 'CONCACAF'),

-- Group J
('Serbia', 'SRB', '🇷🇸', 'J', 'UEFA'),
('Perú', 'PER', '🇵🇪', 'J', 'CONMEBOL'),
('Camerún', 'CMR', '🇨🇲', 'J', 'CAF'),
('Costa Rica', 'CRC', '🇨🇷', 'J', 'CONCACAF'),

-- Group K
('Turquía', 'TUR', '🇹🇷', 'K', 'UEFA'),
('Venezuela', 'VEN', '🇻🇪', 'K', 'CONMEBOL'),
('Sudáfrica', 'RSA', '🇿🇦', 'K', 'CAF'),
('Jamaica', 'JAM', '🇯🇲', 'K', 'CONCACAF'),

-- Group L
('Ucrania', 'UKR', '🇺🇦', 'L', 'UEFA'),
('Honduras', 'HON', '🇭🇳', 'L', 'CONCACAF'),
('Guinea', 'GIN', '🇬🇳', 'L', 'CAF'),
('Jordania', 'JOR', '🇯🇴', 'L', 'AFC')

ON CONFLICT (code) DO NOTHING;
