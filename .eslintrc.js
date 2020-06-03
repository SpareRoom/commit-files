module.exports = {
  extends: ["airbnb-base"],
  rules: {
    "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0, maxEOF: 0 }],
    "no-param-reassign": ["error", { props: false }],
  }
};
