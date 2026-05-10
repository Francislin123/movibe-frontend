-- Migration para adicionar campo birth_date na tabela users
-- Compatível com PostgreSQL, MySQL e H2

-- PostgreSQL
ALTER TABLE users 
ADD COLUMN birth_date DATE;

-- MySQL (descomentar se usar MySQL)
-- ALTER TABLE users 
-- ADD COLUMN birth_date DATE;

-- H2 (para testes/desenvolvimento)
-- ALTER TABLE users 
-- ADD COLUMN birth_date DATE;

-- Índice opcional para melhorar performance em consultas por data de nascimento
CREATE INDEX idx_users_birth_date ON users(birth_date);

-- Comentário sobre a coluna (PostgreSQL)
COMMENT ON COLUMN users.birth_date IS 'Data de nascimento do usuário no formato YYYY-MM-DD';
