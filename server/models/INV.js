const { Schema, model } = require('mongoose');
const SARecord = require('./SARECORD'); // Import the SARecord model

const invData = new Schema(
  {
    recno: { type: String },
    sku_no: { type: String },
    po_no: { type: String },
    mfg_code: { type: String },
    ven_code: { type: String },
    vndr_style: { type: String },
    substyle: { type: String },
    desc: { type: String },
    desc2: { type: String },
    class_12: { type: Number },
    class_34: { type: Number },
    category3: { type: String },
    size: { type: String },
    mat_type: { type: String },
    mat_color: { type: String },
    mat_finish: { type: String },
    cost: { type: Number },
    repl_cost: { type: Number },
    cost_per: { type: Number },
    retail: { type: Number },
    retail_per: { type: Number },
    min_price: { type: Number },
    msrp: { type: Number },
    qty_order: { type: Number },
    date: { type: Date },
    rec_qty1: { type: Number },
    invoice: { type: String },
    originvoic: { type: String },
    item: { type: String },
    loc1: { type: String },
    loc_qty1: { type: Number },
    wt_order: { type: Number },
    wt_rec: { type: Number },
    weight: { type: Number },
    precious: { type: String },
    cprecious: { type: String },
    to_return: { type: Number },
    returned: { type: Number },
    layaway_qt: { type: Number },
    layaway_wt: { type: Number },
    mnemonic: { type: String },
    phys_qty: { type: Number },
    phys_wt: { type: Number },
    memo_qty: { type: Number },
    memo_wt: { type: Number },
    reorderqty: { type: Number },
    reorderwt: { type: Number },
    high_qty: { type: Number },
    high_wt: { type: Number },
    job_order: { type: String },
    comm_perc: { type: Number },
    spiff_perc: { type: Number },
    goldfactor: { type: Number },
    laborcost: { type: Number },
    laborprice: { type: Number },
    part_no: { type: String },
    stdsaleqty: { type: Number },
    picturefil: { type: String },
    polled: { type: Boolean },
    mod_date: { type: Date },
    mod_second: { type: Date },
    store_id: { type: String },
    sku1: { type: String },
    sku2: { type: String },
    temp_logic: { type: String },
    temp_qty: { type: Number },
    temp_date: { type: Date },
    extended: { type: Number },
    pictures: { type: String },
    split_sku: { type: String },
    po_item: { type: String },
    audit_memo: { type: String },
    webcode: { type: String },
    webexpdate: { type: Date },
    chkfield: { type: String },
    store_code: { type: String },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

invData.statics.getStatus = async function (sku_no) {
  const INV = this;

  const getSKUData = await INV.find({ sku_no });

  // Check if all records have `loc_qty1` as 0
  if (
    getSKUData.filter((item) => item.loc_qty1 === 0).length ===
    getSKUData.length
  ) {
    const recordExists = await SARecord.exists({ sku_no });
    return recordExists ? 'sold out' : 'in-transit';
  }

  // For available items, include store codes
  const availableStores = getSKUData
    .filter((item) => item.loc_qty1 > 0)
    .map((item) => item.store_code);

  return `available-${availableStores}`;
};

const INV = model('INV', invData, 'INV'); // Explicitly set the collection name

module.exports = INV;
