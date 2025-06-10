const { PricingPolicy } = require("../models/");

module.exports = {
  async getPricingPolicy(req, res) {
    try {
      const pricingPolicy = await PricingPolicy.find()
        .populate("UpdatedBy", "employeeId")
        .sort({
          Classcode: 1,
          vendor: 1,
        });

      res.status(200).json(pricingPolicy);
    } catch (error) {
      console.error("Error fetching pricing policy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async createPricingPolicy(req, res) {
    try {
      const newPolicy = await PricingPolicy.create(req.body);
      res.status(201).json(newPolicy);
    } catch (error) {
      console.error("Error creating pricing policy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async getByClassCode(req, res) {
    try {
      const { classcode } = req.params;
      const policies = await PricingPolicy.find({
        Classcode: classcode,
      });
      if (!policies.length) {
        return res.status(404).json({
          error: "No pricing policies found for this Classcode",
        });
      }
      res.status(200).json(policies);
    } catch (error) {
      console.error("Error fetching by Classcode:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async updateById(req, res) {
    try {
      const { id } = req.params;
      const policy = await PricingPolicy.findById(id);
      if (!policy) {
        return res.status(404).json({ error: "PricingPolicy not found" });
      }

      // Apply updates to document (merge req.body into policy)
      Object.keys(req.body).forEach((key) => {
        policy[key] = req.body[key];
      });

      // Now save, which triggers pre('save') and updates UpdateDate
      await policy.save();

      res.status(200).json(policy);
    } catch (error) {
      console.error("Error updating pricing policy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },

  async deleteById(req, res) {
    try {
      const { id } = req.params;
      const deletedPolicy = await PricingPolicy.findByIdAndDelete(id);
      if (!deletedPolicy) {
        return res.status(404).json({ error: "PricingPolicy not found" });
      }
      res.status(200).json({ message: "PricingPolicy deleted successfully" });
    } catch (error) {
      console.error("Error deleting pricing policy:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
};
