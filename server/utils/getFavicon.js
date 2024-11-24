const axios = require('axios');
const cheerio = require('cheerio');
const { imageSize } = require('image-size');

async function getFavicon(reqOrUrl, res) {
  const url =
    typeof reqOrUrl === 'string' ? reqOrUrl : reqOrUrl.query.url;

  if (!url) {
    if (res) {
      return res
        .status(400)
        .json({ error: 'URL parameter is required.' });
    }
    throw new Error('URL parameter is required.');
  }

  try {
    const response = await axios.get(url).catch((err) => {
      if (err.response) {
        throw {
          message: 'Failed to fetch the URL.',
          status: err.response.status,
        };
      }
      throw {
        message: 'Network error while fetching the URL.',
        status: 500,
      };
    });

    if (!response || response.status !== 200) {
      if (res) {
        return res
          .status(response?.status || 500)
          .json({ error: 'Failed to fetch the URL.' });
      }
      throw new Error('Failed to fetch the URL.');
    }

    const html = response.data;
    const $ = cheerio.load(html);
    const imageLinks = new Set();

    $('head')
      .find(
        `link[rel="shortcut icon"][href],
        link[rel="icon"][href],
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
          const absoluteLink = new URL(link, url).href;
          imageLinks.add(absoluteLink);
        }
      });

    if (imageLinks.size === 0) {
      if (res) {
        return res
          .status(404)
          .json({
            error: 'No image links found on the provided URL.',
          });
      }
      throw new Error('No image links found on the provided URL.');
    }

    const sortedImageLinks = await Promise.allSettled(
      Array.from(imageLinks).map(async (link) => {
        try {
          const response = await axios
            .get(link, {
              responseType: 'arraybuffer',
            })
            .catch(() => null);

          if (!response || response.status !== 200) {
            return null;
          }

          const dimensions = imageSize(response.data);
          const size = dimensions.width * dimensions.height;
          return { link, size };
        } catch {
          return null;
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
      if (res) {
        return res
          .status(404)
          .json({ error: 'No valid image links found.' });
      }
      throw new Error('No valid image links found.');
    }

    if (res) {
      return res.json({ imageLinks: filteredSortedLinks });
    }
    return { imageLinks: filteredSortedLinks };
  } catch (error) {
    console.error(
      'Error fetching or processing URL:',
      error.message || error
    );
    if (res) {
      res.status(error.status || 500).json({
        error:
          error.message ||
          'An error occurred while processing the URL.',
      });
    }
    throw error; // Re-throw for internal use
  }
}

module.exports = { getFavicon };
