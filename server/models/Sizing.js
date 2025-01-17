const { Schema, model } = require('mongoose');

const sizing = new Schema(
  {
    Date: {
      type: Date,
      // Format the date as "07/25/2023" when sending to the client
      get: (date) => date.toLocaleDateString('en-US'),
      // Parse incoming dates in the "07/25/2023" format
      set: (dateString) => new Date(dateString),
    },
    initial: {
      type: String,
    },
    SKUCode: {
      type: String,
    },
    video: {
      type: String,
      required: true,
      get: function (val) {
        const baseUrl = 'https://mjplusweb.com/V360';
        const formattedValue = val.replace('-', '-');
        return {
          html: `${baseUrl}/${formattedValue}/${formattedValue}.html?d=${formattedValue}&btn=0&sv=0&z=0&sm=0&zoomslide=0`,
          image: `${baseUrl}/${formattedValue}/still.jpg`,
          video: `${baseUrl}/${formattedValue}/video.mp4`,
        };
      },
    },
  },
  {
    toObject: { getters: true, virtuals: true }, // Enable getters when converting to objects
    toJSON: { getters: true, virtuals: true }, // Enable getters when converting to JSON
    strict: false,
  }
);

// Adding a virtual field SKUBase that returns SKUCode.split("-")[0]
sizing.virtual('Classcode').get(function () {
  return this.SKUCode ? this.SKUCode.split('-')[0] : null;
});

const Sizing = model('Sizing', sizing, 'Sizing');

module.exports = Sizing;
