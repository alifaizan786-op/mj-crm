const { ClientForm } = require('../models');
const { mongoDB } = require('../config/connection');

module.exports = {
  async createClient(req, res) {
    try {
      const clientData = {
        email: req.body.Email,
        mobilePhoneNumber: req.body.MobilePhoneNumber,
        homePhoneNumber: req.body.HomePhoneNumber,
        lastName: req.body.LastName,
        firstName: req.body.FirstName,
        addressLine: req.body.AddressLine1,
        city: req.body.City,
        state: req.body.State,
        zipCode: req.body.ZipCode,
        hisBirthday: req.body.HisBirthdayMMDD,
        herBirthday: req.body.HerBirthdayMMDD,
        anniversary: req.body.AnniversaryMMDD,
        marketingOptIn:
          req.body
            .WouldYouLikeToReceiveOurAnnualCatalogscouponsmarketingUpdates,
        dateCreated: req.body.Entry.DateCreated,
        store: req.params.store,
      };

      const newClient = await ClientForm.create(clientData);

      res.status(201).json(newClient);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async todaysData(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const clients = await ClientForm.find({
        $and: [
          {
            store: req.params.store, // Filter by the store value from req.params.store
          },
          {
            $expr: {
              $and: [
                { $gte: [{ $toDate: '$dateCreated' }, today] },
                {
                  $lt: [
                    { $toDate: '$dateCreated' },
                    new Date(today.getTime() + 24 * 60 * 60 * 1000),
                  ],
                },
              ],
            },
          },
        ],
      }).sort({ dateCreated: -1 });

      res.json(clients);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  async last30DaysData(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const last30Days = new Date(
        today.getTime() - 29 * 24 * 60 * 60 * 1000
      );

      const clients = await ClientForm.find({
        $and: [
          {
            store: req.params.store, // Filter by the store value from req.params.store
          },
          {
            $expr: {
              $and: [
                { $gte: [{ $toDate: '$dateCreated' }, last30Days] },
                { $lt: [{ $toDate: '$dateCreated' }, today] },
              ],
            },
          },
        ],
      }).sort({ dateCreated: -1 });

      res.json({
        Total: clients.length,
        clients,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};
