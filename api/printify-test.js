module.exports = async (req, res) => {
  return res.status(200).json({
    prueba: process.env.PRUEBA_SORYNX || "NO EXISTE",
    printify: !!process.env.PRINTIFY_API_TOKEN
  });
};
