const router = require("express").Router();
const {
  getPricingPolicy,
  createPricingPolicy,
  getByClassCode,
  updateById,
  deleteById,
} = require("../../controllers/PricingPolicy-controller");

// /api/pricingpolicy
router.route("/").get(getPricingPolicy).post(createPricingPolicy);

// /api/pricingpolicy/classcode/:classcode
router.route("/classcode/:classcode").get(getByClassCode);

// /api/pricingpolicy/:id
router.route("/:id").put(updateById).patch(updateById).delete(deleteById);

module.exports = router;
