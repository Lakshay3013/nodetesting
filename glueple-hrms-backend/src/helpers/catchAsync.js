const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    console.log(err,"errrrrrrrrrrr")
    next(err)});
};

module.exports = catchAsync;
