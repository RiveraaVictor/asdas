// Arquivo: backend/src/utils/validators.js

// Validação de email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de senha
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

// Validação de nome
const isValidName = (name) => {
  return name && name.trim().length >= 2;
};

// Validação de valor monetário
const isValidAmount = (amount) => {
  return !isNaN(amount) && parseFloat(amount) > 0;
};

// Validação de RTP (Return to Player)
const isValidRTP = (rtp) => {
  return !isNaN(rtp) && rtp >= 0 && rtp <= 100;
};

// Validação de probabilidade
const isValidProbability = (probability) => {
  return !isNaN(probability) && probability >= 0 && probability <= 1;
};

// Validação de código de cupom
const isValidCouponCode = (code) => {
  return code && code.trim().length >= 3 && /^[A-Z0-9]+$/i.test(code);
};

// Sanitização de strings
const sanitizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>]/g, '');
};

// Validação de ID numérico
const isValidId = (id) => {
  return !isNaN(id) && parseInt(id) > 0;
};

// Validação de paginação
const validatePagination = (page, limit) => {
  const validPage = Math.max(1, parseInt(page) || 1);
  const validLimit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  return { page: validPage, limit: validLimit };
};

// Validação de tipo de transação
const isValidTransactionType = (type) => {
  const validTypes = ['deposit', 'withdrawal', 'prize', 'game_cost'];
  return validTypes.includes(type);
};

// Validação de status de transação
const isValidTransactionStatus = (status) => {
  const validStatuses = ['pending', 'completed', 'failed', 'cancelled'];
  return validStatuses.includes(status);
};

// Validação de tipo de cupom
const isValidCouponType = (type) => {
  const validTypes = ['free_game', 'bonus_balance', 'cashback'];
  return validTypes.includes(type);
};

// Validação de método de pagamento
const isValidPaymentMethod = (method) => {
  const validMethods = ['credit_card', 'debit_card', 'pix', 'bank_transfer'];
  return validMethods.includes(method);
};

// Validação de tema do jogo
const isValidGameTheme = (theme) => {
  const validThemes = ['classic', 'pirate', 'fruit', 'jackpot', 'adventure', 'fantasy', 'sports', 'casino'];
  return !theme || validThemes.includes(theme);
};

// Validação de data
const isValidDate = (date) => {
  return date && !isNaN(Date.parse(date));
};

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidName,
  isValidAmount,
  isValidRTP,
  isValidProbability,
  isValidCouponCode,
  sanitizeString,
  isValidId,
  validatePagination,
  isValidTransactionType,
  isValidTransactionStatus,
  isValidCouponType,
  isValidPaymentMethod,
  isValidGameTheme,
  isValidDate
};