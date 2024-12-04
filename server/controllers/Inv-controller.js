const { INV } = require('../models');

module.exports = {
  getOneSku(req, res) {
    INV.find({
      sku_no: req.params.sku,
    })
      .select('-__v -_id')
      .then((data) => {
        res.json(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json(err);
      });
  },
};
