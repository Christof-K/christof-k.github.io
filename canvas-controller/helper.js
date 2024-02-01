export const lerp = (from, to, acc) => {
  return from + acc * (to - from);
};

export const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const clampValue = (value, from, to) => {
  return Math.min(Math.max(value, from), to);
};
