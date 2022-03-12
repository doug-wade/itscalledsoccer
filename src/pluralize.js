// Our needs are very sophisticated, and neither is this function.
export default (word) => {
  if (word === "stadium") {
    return "stadia";
  }
  return `${word}s`;
};
