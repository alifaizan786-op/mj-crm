const axios = require('axios');
const cheerio = require('cheerio');
const { imageSize } = require('image-size');

async function getFavicon(req, res) {
  const url = req.query.url;

  if (!url) {
    return res
      .status(400)
      .json({ error: 'URL parameter is required.' });
  }

  try {
    const response = await axios.get(url);

    if (response.status !== 200) {
      return res
        .status(response.status)
        .json({ error: 'Failed to fetch the URL.' });
    }

    const html = response.data;
    const $ = cheerio.load(html);
    const imageLinks = new Set();

    $('head')
      .find(
        `link[rel="icon"][href],
         link[rel="apple-touch-icon"][href],
         link[rel="icon"][type="image/png"][href],
         link[rel="icon"][type="image/webp"][href],
         link[rel="icon"][type="image/jpeg"][href],
         meta[property="og:image"][content],
         meta[name="og:image"][content],
         meta[itemprop="image"][content]`
      )
      .each((_, element) => {
        const link = $(element).attr('href');
        if (link) {
          const absoluteLink = new URL(link, url).href; // Convert to absolute URL.
          imageLinks.add(absoluteLink);
        }
      });

    if (imageLinks.size === 0) {
      return res
        .status(404)
        .json({ error: 'No image links found on the provided URL.' });
    }

    const sortedImageLinks = await Promise.allSettled(
      Array.from(imageLinks).map(async (link) => {
        try {
          const response = await axios.get(link, {
            responseType: 'arraybuffer',
          });
          const dimensions = imageSize(response.data);
          const size = dimensions.width * dimensions.height;
          return { link, size };
        } catch {
          return null; // Ignore errors for individual images.
        }
      })
    );

    const filteredSortedLinks = sortedImageLinks
      .filter(
        (result) => result.status === 'fulfilled' && result.value
      )
      .map((result) => result.value)
      .sort((a, b) => b.size - a.size)
      .map((item) => item.link);

    if (filteredSortedLinks.length === 0) {
      return res
        .status(404)
        .json({ error: 'No valid image links found.' });
    }

    res.json({ imageLinks: filteredSortedLinks });
  } catch (error) {
    console.error('Error fetching or processing URL:', error.message);
    res
      .status(500)
      .json({ error: 'An error occurred while processing the URL.' });
  }
}

module.exports = { getFavicon };
