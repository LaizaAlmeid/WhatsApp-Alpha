class PingController {

  async index(req, res) {
    const { status } = req.body;
    console.log("SERVICO ATIVO")
    return res.status(200).json({
        status: req.body
      }
    )
    
  }
}

module.exports = new PingController();