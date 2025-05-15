const puppeteer = require('puppeteer');
const { URL } = require('url');

function normalizeUrl(url) {
  // Decode the URL to handle encoded characters
  let decodedUrl = decodeURIComponent(url);

  // Parse the URL into parts
  let urlObj = new URL(decodedUrl);

  // Normalize the path (optional, for case or extension differences)
  urlObj.pathname = urlObj.pathname
    .toLowerCase()
    .replace(/\.aspx$/, '');

  // Map query parameters (e.g., treat MobCSCCode as equivalent to CSCCode)
  if (urlObj.searchParams.has('MobCSCCode')) {
    urlObj.searchParams.set(
      'CSCCode',
      urlObj.searchParams.get('MobCSCCode')
    );
    urlObj.searchParams.delete('MobCSCCode');
  }

  // Remove any irrelevant query parameters, if necessary
  // Example: If "Category" is optional, you can choose to keep or remove it.
  // Uncomment below if you want to remove specific parameters:
  // urlObj.searchParams.delete("Category");

  // Sort query parameters alphabetically
  let sortedParams = [...urlObj.searchParams.entries()].sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  // Rebuild the query string with sorted parameters
  urlObj.search = new URLSearchParams(sortedParams).toString();

  // Reconstruct the normalized URL
  return `${urlObj.origin}${urlObj.pathname}${
    urlObj.search ? '?' + urlObj.search : ''
  }`;
}

/**
 * Generate sitemap XML content from URLs with comments for anchor text
 * @param {{ href: string, text: string }[]} urlData
 * @returns {string}
 */
const generateSitemapXmlWithComments = (urlData) => {
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString();
  const urlSet = urlData
    .map(({ href, text }) => {
      const sanitizedText = text.replace(/\s+/g, ' ').trim();
      const comment = sanitizedText
        ? `<!-- ${sanitizedText} -->\n`
        : '';
      return `${comment}  <url>\n    <loc>${href}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`;
    })
    .join('\n');

  return `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">

  ${urlSet}
  </urlset>`;
};

/**
 * Validate if a string is a valid URL
 * @param {string} url
 * @returns {boolean}
 */
const isValidUrl = (url) => {
  try {
    new URL(url); // The `URL` constructor will throw an error for invalid URLs
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Fetch all hrefs from multiple URLs and return sitemap XML
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
module.exports = {
  async createSitemap(req, res) {
    const { targetUrls } = req.body;

    // Validate the targetUrls array
    if (
      !Array.isArray(targetUrls) ||
      targetUrls.some((url) => !isValidUrl(url))
    ) {
      return res
        .status(400)
        .send('Invalid or missing targetUrls array.');
    }

    const allAnchorData = [];

    try {
      // Launch Puppeteer
      const browser = await puppeteer.launch();

      for (const targetUrl of targetUrls) {
        const page = await browser.newPage();

        try {
          // Go to the current URL and wait for network idle
          await page.goto(targetUrl, { waitUntil: 'networkidle2' });

          // Extract all anchor tags, their hrefs, and inner text
          const anchorData = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('a'))
              .filter(
                (anchor) =>
                  anchor.href &&
                  anchor.href !== 'javascript:void(0)' &&
                  anchor.getAttribute('href') !== ''
              )
              .map((anchor) => ({
                href: anchor.href,
                text: anchor.innerText.trim(),
              }));
          });

          // Add the extracted anchors to the global list
          allAnchorData.push(...anchorData);
        } catch (error) {
          console.error(
            `Error processing URL ${targetUrl}:`,
            error.message
          );
        } finally {
          await page.close();
        }
      }

      // Close the browser
      await browser.close();

      // Filter and remove duplicate URLs
      const uniqueUrls = [
        ...new Map(
          allAnchorData.map((item) => [item.href, item])
        ).values(),
      ];

      // Further deduplicate by replacing URL parameters
      const dedup = new Map(
        uniqueUrls
          .map((item) => {
            if (item.href.includes('CSCCode')) {
              return [
                item.href.split('CSCCode=')[1].split('&Category=')[0],
                item,
              ];
            } else if (item.href.includes('MobCSCCode')) {
              return false;
            } else {
              return [normalizeUrl(item.href), item];
            }
          })
          .filter(Boolean)
      );

      // Convert the Map to an array before sending in the response
      const dedupArray = Array.from(dedup.values());

      //   res.status(200).json(dedupArray);

      // Generate sitemap XML content with comments
      // const sitemapXml = generateSitemapXmlWithComments(dedupArray);

      // Return the XML as a response
      // res.set('Content-Type', 'application/xml');
      // res.send(sitemapXml);
      res.json(dedupArray);
    } catch (error) {
      console.error('Error generating sitemap:', error.message);
      res.status(500).send('Error generating sitemap.');
    }
  },
};
