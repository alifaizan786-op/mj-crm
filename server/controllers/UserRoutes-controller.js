const { UserRoutes } = require('../models');

module.exports = {
  // Create a new route
  async createRoute(req, res) {
    try {
      const { name, path, element, menuItem } = req.body;

      // Validate required fields
      if (!name || !path || !element) {
        return res
          .status(400)
          .json({ error: 'Name, path, and element are required' });
      }

      const newRoute = new UserRoutes({
        name,
        path,
        element,
        menuItem: menuItem !== undefined ? menuItem : true, // Use default if not provided
      });

      await newRoute.save();
      res.status(201).json({
        message: 'Route created successfully',
        route: newRoute,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Get all routes
  async getAllRoutes(req, res) {
    try {
      const routes = await UserRoutes.find({}).sort({ path: 1 });
      res.status(200).json(routes);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Get routes by paths (filter)
  async getRoutesByPaths(req, res) {
    try {
      const { paths } = req.body; // Expecting an array of paths in the request body

      if (!Array.isArray(paths)) {
        return res
          .status(400)
          .json({ error: 'Paths must be an array' });
      }

      const routes = await UserRoutes.find({
        path: { $in: paths },
      }).sort({ _id: -1 });
      res.status(200).json(routes);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Update a route by ID
  async updateRoutes(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Check if the route exists
      const route = await UserRoutes.findById(id);
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }

      // Update the route
      const updatedRoute = await UserRoutes.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      res.status(200).json({
        message: 'Route updated successfully',
        route: updatedRoute,
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  // Delete a route by ID
  async deleteRoutes(req, res) {
    try {
      const { id } = req.params;

      // Check if the route exists
      const route = await UserRoutes.findById(id);
      if (!route) {
        return res.status(404).json({ error: 'Route not found' });
      }

      // Delete the route
      await UserRoutes.findByIdAndDelete(id);
      res.status(200).json({ message: 'Route deleted successfully' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
