module.exports = async function (req, res, next) {
  try {
    for (let keys of Object.keys(req.body)) {
      req[keys] = req.body[keys];
    }
    next();
  } catch (err) {
    res.status(400).send("Invalid request body");
  }
};
