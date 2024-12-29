require('dotenv').config();
const { MalaniWEB } = require('../config/connection');
const sql = require('mssql');
const OpenAI = require('openai');
const { INV } = require('../models');

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_MJ_CRM_01,
});

class Web {
  constructor() {
    this.db = sql.connect(MalaniWEB);
    this.mainQuery = `SELECT 
    Styles.Code,
    Styles.SKUCode,
    Styles.StyleDesc,
    Styles.SubCatCode,
     CONCAT(
        CASE WHEN CSC3.CatSubCat IS NOT NULL THEN CSC3.CatSubCat ELSE '' END,
        CASE WHEN CSC3.CatSubCat IS NOT NULL THEN ' > ' ELSE '' END,
        CASE WHEN CSC2.CatSubCat IS NOT NULL THEN CSC2.CatSubCat ELSE '' END,
        CASE WHEN CSC2.CatSubCat IS NOT NULL AND CatSubCats.CatSubCat IS NOT NULL THEN ' > ' ELSE '' END,
        COALESCE(CatSubCats.CatSubCat, '')
    ) AS CategoryHierarchy, -- Directly added to SELECT
    GoldKarat.LongData AS GoldKarat,
    Styles.AttribField84 AS Finish,
    Styles.AttribField85 AS NumberOfPcs,
    Styles.AttribField86 AS JewelryFor,
    Styles.AttribField115 AS JewelryType,
    CatSubCats.CatSubCat AS Category,
    Styles.GoldWeight,
    Styles.AttribField87 AS CenterDiamondWeight,
    Styles.AttribField88 AS DiamondTotalWeight,
    Styles.AttribField89 AS DiamondTotalPcs,
    Styles.AttribField90 AS DiamondClarity,
    Styles.AttribField91 AS DiamondColor,
    Styles.AttribField92 AS Length,
    Styles.AttribField93 AS Width,
    Styles.AttribField83 AS PendantLength,
    Styles.AttribField94 AS PendantWidth,
    Styles.AttribField95 AS EarringLength,
    Styles.AttribField96 AS EarringWidth,
    Styles.AttribField105 AS EarringPostType,
    Styles.StyleEntryDate,
    ClassCodes.ClassCode,
    Styles.VendStyleCode,
    Styles.StyleGrossWt,
    Styles.TagPrice,
    Styles.StockQty,
    Styles.IsCloseOut,
    Styles.IsNewArrived,
    Styles.IsHotSeller,
    Styles.StyleStory,
    Styles.StoreCode,
    Styles.ShowPriceFallFlag,
    Styles.CustPrice,
    Styles.PerGramOrDisc,
    Styles.Minorcode,
    Styles.Purchasable,
    Styles.StyleUploadDate,
    Styles.Hidden,
    Styles.IsGIACertified,
    Styles.AutoUpdatePrice,
    Styles.ShowRetailPrice,
    Styles.StyleLongDesc,
    Styles.AttribField97 AS RingSize,
    Styles.AttribField98 AS RingDesignHeight,
    Styles.AttribField99 AS RingWidth,
    Styles.AttribField100 AS BangleSize,
    Styles.AttribField101 AS BangleInnerDiameter,
    Styles.AttribField102 AS BangleWidth, 
    Styles.AttribField103 AS BangleDesignHeight,
    Styles.AttribField104 AS ChainIncludedInPrice,
    Styles.AttribField106 AS BangleBraceletType,
    Styles.AttribField107 AS NosePinType,
    Styles.AttribField108 AS RingType,
    Styles.AttribField109 AS WatchDisclaimer,
    Styles.AttribField110 AS ChnageableStoneIncluded,
    Styles.AttribField111 AS BangleBraceletSizeAdjustableUpTo,
    Styles.AttribField112 AS DiamondType,
    Styles.AttribField113 AS GemstoneType,
    Styles.AttribField114 AS GemstoneWeight,
    Styles.AttribField117 AS ChainLength,
    Styles.AttribField118 AS CertNo,
    Styles.AttribField119 AS Cert,
    Styles.AttribField120 AS DC,
    Styles.IsCustomDesign,
    Styles.AttribField122 AS KW1,
    Styles.AttribField123 AS KW2,
    Styles.AttribField124 AS KW3,
    Styles.AttribField125 AS KW4,
    Styles.AttribField126 AS KW5,
    Styles.AttribField127 AS KW6,
    Styles.AttribField128 AS KW7,
    Styles.AttribField129 AS KW18,
    Styles.AttribField131 AS SearchUploadDate,
    Styles.AttribField132 AS Cert#2,
    Styles.AttribField133 AS Cert#3,
    Styles.AttribField134 AS Cert#2,
    Styles.AttribField141 AS MultiStyleCode,
    Styles.AttribField142 AS WhyHidden,
    Vendors.VendorName AS Vendor,
    Color.LongData AS Color
FROM 
    Styles
INNER JOIN 
    CatSubCats ON Styles.SubCatCode = CatSubCats.Code -- Level 1
LEFT JOIN 
    CatSubCats AS CSC2 ON CatSubCats.ParentCode = CSC2.Code -- Level 2
LEFT JOIN 
    CatSubCats AS CSC3 ON CSC2.ParentCode = CSC3.Code -- Level 3
INNER JOIN 
    Vendors ON Styles.VendCode = Vendors.Code
INNER JOIN 
    ClassCodes ON Styles.ClassCode = ClassCodes.Code
INNER JOIN 
    CommonMastersData AS GoldKarat ON Styles.GoldKt = GoldKarat.Code
LEFT JOIN 
    CommonMastersData AS Color ON Styles.Color = Color.Code`;

    // Bind the method
    this.getOneSku = this.getOneSku.bind(this);
    this.openToBuy = this.openToBuy.bind(this);
    this.getMajorCode = this.getMajorCode.bind(this);
    this.getAllFromArr = this.getAllFromArr.bind(this);
    this.reportBuilder = this.reportBuilder.bind(this);
    this.descriptionGenerator = this.descriptionGenerator.bind(this);
    this.uploadingReport = this.uploadingReport.bind(this);
    this.getSkuBySearchDate = this.getSkuBySearchDate.bind(this);
    this.outOfStockOnline = this.outOfStockOnline.bind(this);
  }

  async getOneSku(req, res) {
    try {
      let pool = await this.db;

      let result1 = await pool.request().query(`${this.mainQuery}
                where SKUCode = '${req.params.sku}'`);

      res.json(result1.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  }

  async getMajorCode(req, res) {
    try {
      let pool = await this.db;

      let result1 = await pool.request().query(`${this.mainQuery}
                where ClassCodes.ClassCode = '${req.params.majorCode}'
                AND Styles.StockQty = 1
                AND Styles.Hidden = 0
                AND Styles.Purchasable = 1
                `);

      res.json(result1.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  }

  async openToBuy(req, res) {
    try {
      let pool = await this.db;
      let result1 = await pool.request()
        .query(`SELECT ClassCodes.ClassCode as majorCode, ClassCodes.BaseColumn as baseColumn, COUNT(*) as totalQty
                FROM Styles
                INNER JOIN ClassCodes ON Styles.ClassCode = ClassCodes.Code
                WHERE Purchasable = '1' AND StockQty = '1' AND Hidden = '0' AND Img1 IS NULL
                GROUP BY ClassCodes.ClassCode, ClassCodes.BaseColumn
                ORDER BY 1;`);

      let templateObject = {
        totalQty: 0,
        totalBaseQty: 0,
        totalRetail: 0,
        store: 'Web',
        majorCodes: [],
      };

      // Use a map to simplify lookups for existing majorCodes
      let majorCodeMap = new Map();
      for (let record of result1.recordset) {
        templateObject.totalQty += record.totalQty; // Increment totalQty
        templateObject.totalBaseQty += record.baseColumn; // Increment totalQty

        // Store an object containing baseColumn and totalQty
        majorCodeMap.set(record.majorCode, {
          baseColumn: record.baseColumn,
          totalQty: record.totalQty,
        });
      }

      // Loop through all possible majorCodes (1 to maxMajorCode)
      const maxMajorCode = Math.max(...majorCodeMap.keys());
      for (let i = 1; i <= maxMajorCode; i++) {
        let data = majorCodeMap.get(i) || {
          baseColumn: null,
          totalQty: 0,
        }; // Default values for missing codes

        templateObject.majorCodes.push({
          majorCode: i,
          baseColumn: data.baseColumn, // Add baseColumn to the output
          totalQty: {
            majorCode: i,
            totalQty: data.totalQty, // Use existing totalQty or default to 0
          },
        });
      }

      res.json([templateObject]);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  }

  async getAllFromArr(req = null, res = null, arr = []) {
    let skusArr;

    if (req && req.body && req.body.SKUs) {
      skusArr = req.body.SKUs;
    } else {
      skusArr = arr;
    }

    if (!Array.isArray(skusArr) || skusArr.length === 0) {
      if (res) {
        return res
          .status(400)
          .json({ error: 'Invalid SKUs parameter' });
      } else {
        throw new Error('SKUs array must be provided and non-empty');
      }
    }

    try {
      let tempString = 'WHERE ';
      skusArr.forEach((element, index) => {
        tempString +=
          index === skusArr.length - 1
            ? `SKUCode = '${element}'`
            : `SKUCode = '${element}' OR `;
      });

      let pool = await this.db;
      let result = await pool
        .request()
        .query(`${this.mainQuery} ${tempString}`);

      if (res) {
        return res.json(result.recordset);
      } else {
        return result.recordset; // Return the result for internal use
      }
    } catch (err) {
      console.error('Error in getAllFromArr:', err);
      if (res) {
        return res
          .status(500)
          .json({ error: 'Internal Server Error' });
      } else {
        throw err;
      }
    }
  }

  async reportBuilder(req, res) {
    try {
      let pool = await this.db;

      let result1 = await pool
        .request()
        .query(`${this.mainQuery} ${generateMSSQLQuery(req.body)}`);

      res.json(result1.recordset);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  }

  async descriptionGenerator(req, res) {
    try {
      let pool = await this.db;

      let result1 = await pool.request().query(`${this.mainQuery}
                where SKUCode = '${req.params.sku}'`);

      delete result1.recordset[0].Code;
      delete result1.recordset[0].StyleEntryDate;
      delete result1.recordset[0].ClassCode;
      delete result1.recordset[0].VendStyleCode;
      delete result1.recordset[0].TagPrice;
      delete result1.recordset[0].IsCloseOut;
      delete result1.recordset[0].IsNewArrived;
      delete result1.recordset[0].IsHotSeller;
      delete result1.recordset[0].StoreCode;
      delete result1.recordset[0].ShowPriceFallFlag;
      delete result1.recordset[0].ShowPriceFallFlag;
      delete result1.recordset[0].Purchasable;
      delete result1.recordset[0].StyleUploadDate;
      delete result1.recordset[0].Hidden;
      delete result1.recordset[0].AutoUpdatePrice;
      delete result1.recordset[0].ShowRetailPrice;
      delete result1.recordset[0].DC;
      delete result1.recordset[0].SearchUploadDate;
      delete result1.recordset[0]['Cert#2'];
      delete result1.recordset[0].Vendor;
      delete result1.recordset[0].Minorcode;
      delete result1.recordset[0].SKUCode;
      delete result1.recordset[0].CustPrice;

      let prompt = `Use the following info to write a product description, 
      Make sure the description contains all dimensions and is search engine 
      optimized and mention that this product is by "Malani Jeweler"
      \n\n1000 chars max\n\n\n`;

      // Remove properties with null values
      result1.recordset.forEach((record) => {
        for (const key in record) {
          if (record[key] !== null) {
            prompt += `${key.replace(
              /([a-z0-9])([A-Z])/g,
              '$1 $2'
            )}: ${record[key]}\n`;
          }
        }
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
            ],
          },
        ],
        response_format: {
          type: 'text',
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      res.json({ desc: response.choices[0].message.content });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: err });
    }
  }

  async uploadingReport(req, res) {
    try {
      let pool = await this.db;

      let result1 = await pool.request().query(`
            SELECT AttribField131 AS SearchUploadDate,        
            COUNT(DISTINCT CASE WHEN StockQty = 1 AND Hidden = 0 AND Purchasable = 1 THEN SKUCode END) AS AvailableSKUCount,
            COUNT(DISTINCT CASE WHEN StockQty = 0 AND Hidden = 1 AND Purchasable = 1 THEN SKUCode END) AS HiddenSKUCount
            FROM Styles
            WHERE LEN(AttribField131) = 7
            GROUP BY AttribField131
            ORDER BY CONVERT(DATE, AttribField131, 6) DESC;`);

      res.json(result1.recordset);
    } catch (err) {
      console.log(err);
    }
  }

  async getSkuBySearchDate(req, res) {
    try {
      let pool = await this.db;
      let result1 = await pool.request().query(`
        Select SKUCode from Styles where AttribField131 = '${req.params.uploadDate}'`);
      res.json(result1.recordset);
    } catch (err) {
      console.log(err);
    }
  }

  async outOfStockOnline(req, res) {
    try {
      let pool = await this.db;

      let result1 = await pool.request().query(
        `SELECT SKUCode FROM Styles ${generateMSSQLQuery({
          StockQty: ['1'],
          Purchasable: ['1'],
          Hidden: ['0'],
          custPrice: { min: 0, max: 999999 },
        })}`
      );

      // Fetch data from MongoDB based on SKU array
      const data = await INV.aggregate([
        {
          $match: {
            sku_no: {
              $in: result1.recordset.map((item) => item.SKUCode),
            },
          },
        },
        {
          $sort: {
            loc_qty1: -1, // Prefer loc_qty1: 1 (higher values first)
            sku_no: -1, // Secondary sort by SKU number (if needed)
          },
        },
        {
          $group: {
            _id: '$sku_no', // Group by SKU
            doc: { $first: '$$ROOT' }, // Take the first document for each SKU
          },
        },
        {
          $replaceRoot: { newRoot: '$doc' }, // Flatten the result to original document structure
        },
        {
          $project: {
            _id: 1,
            uuid: 1,
            sku_no: 1,
            class_12: 1,
            class_34: 1,
            date: 1,
            desc: 1,
            desc2: 1,
            loc_qty1: 1,
            retail: 1,
            store_code: 1,
            ven_code: 1,
            vndr_style: 1,
            weight: 1,
          },
        },
      ]);

      // Filter SKUs where loc_qty1 is 0 for further status checks
      const soldOutCandidates = data.filter(
        (item) => item.loc_qty1 === 0
      );

      // Calculate statuses only for sold-out candidates
      const soldOutStatuses = await Promise.all(
        soldOutCandidates.map(async (skuData) => {
          const status = await INV.getStatus(skuData.sku_no); // Call the static method
          return { ...skuData, status }; // Include the status in the response
        })
      );

      res.json(
        soldOutStatuses
          .filter((item) => item.status == 'sold out')
          .map((item) => item.sku_no)
      );
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new Web(MalaniWEB);

function generateMSSQLQuery(body) {
  let query = '';
  const conditions = [];
  let sortColumn = '';

  for (const key in body) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      const value = body[key];

      switch (key) {
        case 'CustPrice':
          const minPrice = value.min;
          const maxPrice = value.max;
          const priceCondition = `CustPrice >= ${minPrice} AND CustPrice < ${maxPrice}`;
          conditions.push(`(${priceCondition})`);
          break;
        case 'Years': // Adjusted to query by StyleEntryDate year
          if (value.length > 0) {
            const years = value.map((year) => `'${year}'`).join(', ');
            const dateCondition = `YEAR(StyleEntryDate) IN (${years})`;
            conditions.push(`(${dateCondition})`);
          }
          break;
        case 'CategoryHierarchy': // Repeat CONCAT logic for CategoryHierarchy
          if (Array.isArray(value) && value.length > 0) {
            const hierarchyConditions = value
              .map(
                (hierarchy) => `
                  CONCAT(
                    CASE WHEN CSC3.CatSubCat IS NOT NULL THEN CSC3.CatSubCat ELSE '' END,
                    CASE WHEN CSC3.CatSubCat IS NOT NULL THEN ' > ' ELSE '' END,
                    CASE WHEN CSC2.CatSubCat IS NOT NULL THEN CSC2.CatSubCat ELSE '' END,
                    CASE WHEN CSC2.CatSubCat IS NOT NULL AND CatSubCats.CatSubCat IS NOT NULL THEN ' > ' ELSE '' END,
                    COALESCE(CatSubCats.CatSubCat, '')
                  ) = '${hierarchy}'`
              )
              .join(' OR ');
            conditions.push(`(${hierarchyConditions})`);
          }
          break;
        case 'sort':
          switch (value[0]) {
            case 'Price: High To Low':
            case 'Price: Low To High':
              sortColumn = 'CustPrice';
              break;
            case 'Entry Date: New To Old':
            case 'Entry Date: Old To New':
              sortColumn = 'StyleEntryDate';
              break;
            case 'Classcode: Low To High':
            case 'Classcode: High To Low':
              sortColumn = 'ClassCodes.ClassCode';
              break;
            case 'Weight: High To Low':
            case 'Weight: Low To High':
              sortColumn = 'StyleGrossWt';
              break;
            default:
              break;
          }
          break;
        default:
          if (Array.isArray(value)) {
            const condition = value
              .map((val) => `${key} = '${val}'`)
              .join(' OR ');
            conditions.push(`(${condition})`);
          } else if (typeof value === 'object' && value !== null) {
            const min = value.min;
            const max = value.max;
            const condition = `${key} >= ${min} AND ${key} < ${max}`;
            conditions.push(`(${condition})`);
          }
          break;
      }
    }
  }

  query = 'WHERE ';

  for (let i = 0; i < conditions.length; i++) {
    if (conditions[i] !== '()') {
      if (i === conditions.length - 1) {
        query += `${conditions[i]}`;
      } else {
        query += `${conditions[i]} AND `;
      }
    }
  }

  query += ' AND (isDeleted IS NULL)';

  if (sortColumn) {
    query += ` ORDER BY ${sortColumn}`;
    if (
      body.sort[0].startsWith('Price: Low') ||
      body.sort[0].startsWith('Entry Date: New') ||
      body.sort[0].startsWith('Weight: High')
    ) {
      query += ' ASC';
    }
  }

  return query;
}

function insertMissingObjects(dataArray) {
  const maxMajorCode = 1000; // Assuming the maximum majorCode is 1000

  for (let i = 1; i <= maxMajorCode; i++) {
    const existingObject = dataArray.find(
      (obj) => obj.majorCode === i
    );

    if (!existingObject) {
      // Insert a new object with baseColumn and totalQty set to 0
      const newObject = {
        majorCode: i,
        baseColumn: 0,
        totalQty: 0,
      };

      // Find the appropriate spot to insert the new object
      let insertIndex = dataArray.findIndex(
        (obj) => obj.majorCode > i
      );

      // If no greater majorCode found, insert at the end
      if (insertIndex === -1) {
        insertIndex = dataArray.length;
      }

      // Insert the new object at the calculated index
      dataArray.splice(insertIndex, 0, newObject);
    }
  }

  return dataArray;
}
