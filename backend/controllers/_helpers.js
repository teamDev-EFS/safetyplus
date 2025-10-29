// controllers/_helpers.js
export const asyncH = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export const ok = (res, data) => res.json(data);
export const created = (res, data) => res.status(201).json(data);
export const badRequest = (res, message) => res.status(400).json({ message });
