module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({
      message: "Método no permitido."
    });
  }

  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = "28925865";

  if (!token) {
    return res.status(500).json({
      success: false,
      message: "No existe PRINTIFY_API_TOKEN."
    });
  }

  try {
    const response = await fetch(
      `https://api.printify.com/v1/shops/${shopId}/products.json`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: "Printify rechazó la petición.",
        error: data
      });
    }

    return res.status(200).json({
      success: true,
      shopId,
      products: data
    });

  } catch (error) {
    console.error("Printify products error:", error);

    return res.status(500).json({
      success: false,
      message: "No se pudieron obtener los productos.",
      error: error.message
    });
  }
};
