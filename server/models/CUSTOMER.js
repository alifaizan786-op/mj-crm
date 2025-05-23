const { Schema, model } = require('mongoose');

const CustomerSchema = new Schema(
  {
    recno: { type: Number },
    last: { type: String, required: true },
    customer: { type: String },
    first: { type: String, required: true },
    title1: { type: String },
    address: { type: String },
    address2: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    country: { type: String },
    carrier: { type: String },
    inactive: { type: Boolean },
    home: { type: String },
    exthome: { type: String },
    work: { type: String },
    extwork: { type: String },
    fax: { type: String },
    extfax: { type: String },
    mobile: { type: String },
    extmobile: { type: String },
    spouse: { type: String },
    title2: { type: String },
    spouselast: { type: String },
    spwork: { type: String },
    extspwork: { type: String },
    comments: { type: String },
    py_purch: { type: Number },
    ytd_purch: { type: Number },
    cust_type: { type: String },
    last_purch: { type: Date },
    clerk: { type: String },
    purchases: { type: Number },
    profit: { type: Number },
    notes: { type: String },
    misc_xml: { type: String },
    wholesale: { type: Boolean },
    resaleno: { type: String },
    salut: { type: String },
    discount: { type: Number },
    disc_basis: { type: String },
    tax_exempt: { type: Boolean },
    date_added: { type: Date },
    email: { type: String },
    emailcode: { type: String },
    emailspous: { type: String },
    website: { type: String },
    purchvisit: { type: Number },
    polled: { type: Boolean },
    mod_date: { type: Date },
    mod_second: { type: Date },
    store_id: { type: String },
    bp_dollars: { type: Number },
    bp_earned: { type: Number },
    bp_redeem: { type: Number },
    bp_1stdate: { type: Date },
    balance: { type: Number },
    pm: { type: String },
    chargeacct: { type: Boolean },
    pictures: { type: String },
    qbid: { type: String },
    qbseq: { type: String },
    qbadd: { type: Boolean },
    qbmod: { type: Boolean },
    chkfield: { type: String },
    gender: { type: String },
    spousegend: { type: String },
    ringsize: { type: String },
    spousering: { type: String },
    store_code: { type: String },
  },
  {
    optimisticConcurrency: true,
    collation: { locale: 'en', strength: 2 },
  }
);

const CUSTOMER = model('CUSTOMER', CustomerSchema, 'CUSTOMER');

module.exports = CUSTOMER;
