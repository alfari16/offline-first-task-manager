export const addSpace = (text, space) => {
  return `${text}${' '.repeat(space)}`.substring(0, space);
};
