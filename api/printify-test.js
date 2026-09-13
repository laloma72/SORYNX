module.exports = async (req, res) => {
  const token = process.env.PRINTIFY_API_TOKEN;

  return res.status(200).json({
    success: true,
    tokenExists: !!token,
    tokenLength: token ? token.length : 0,
    nodeEnv: process.env.NODE_ENV
  });
};
