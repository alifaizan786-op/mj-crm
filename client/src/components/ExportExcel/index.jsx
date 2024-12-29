'use client';

import React from 'react';

import { MenuItem } from '@mui/material';

import * as XLSX from 'xlsx';

import {
  gridFilteredSortedRowIdsSelector,
  GridToolbarExportContainer,
  gridVisibleColumnFieldsSelector,
  useGridApiContext,
} from '@mui/x-data-grid';

export default function ExportButton(props) {
  return (
    <GridToolbarExportContainer {...props}>
      <ExportMenuItem />
    </GridToolbarExportContainer>
  );
}

function ExportMenuItem(props) {
  const apiRef = useGridApiContext();
  const { hideMenu } = props;

  const config = {
    columnNames: [
      'SrNo',
      'Category',
      'SubCategory',
      'SKUCode',
      'Note',
      'Classcode',
      'Minorcode',
      'TotCost',
      'TagPrice',
      'StockQty',
      'SKUEntryDate',
      'SKUUploadDate',
      'Vendor',
      'VendStyle',
      'Store',
      'StyleGrossWt',
      'GoldWeight',
      'StyleDesc',
      'StyleDesc2',
      'GoldKT',
      'Color',
      'ShowPriceFallFlag',
      'IsCloseOut',
      'IsNewArrived',
      'IsHotSeller',
      'Purchasable',
      'Hidden',
      'AutoUpdatePrice',
      'ShowRetailPrice',
      'Jewelry For',
      'Jewelry Type',
      'Finishing',
      'Number of Pcs',
      'Diamond Type',
      'Diamond Total Weight',
      'Diamond Clarity',
      'Diamond Total Pcs',
      'Diamond Color',
      'Center Diamond Weight',
      'IsGIACertified',
      'Length',
      'Width',
      'Pendant Length',
      'Pendant Width',
      'Earrings Length',
      'Earrings Width',
      'Earring Post Type',
      'Ring Size',
      'Ring Design Height',
      'Ring Width',
      'Ring Type',
      'Bangle Size',
      'Bangle/Bracelet Size Adjustable up-to',
      'Bangle Inner Diameter',
      'Bangle Width',
      'Bangle Design Height',
      'Bangle/Bracelet Type',
      'Chain included in the price',
      'Nose Pin Type',
      'Watch Disclaimer',
      'Changeable Stones Included',
      'Gemstones Weight',
      'Disclaimer',
      'Gemstones Type',
      'MarginPrice',
      'Classification',
      'CustPrice',
      'PerGramOrDisc',
      'Collection',
      'StyleName',
      'Chain Length',
      'RelatedSKU',
      'Certificate#',
      'Certification',
      'DC',
      'SearchUploadDate',
      'MultiStyleCode',
    ],
    keys: [
      'SrNo',
      'Category',
      'SubCategory',
      'SKUCode',
      'Note',
      'majorCode',
      'minorCode',
      'TotCost',
      'RETAIL',
      'LOC_QTY1',
      'DATE',
      'SKUUploadDate',
      'VEN_CODE',
      'VNDR_STYLE',
      'STORE',
      'WEIGHT',
      'GoldWeight',
      'DESC',
      'DESC2',
      'GoldKT',
      'Color',
      'ShowPriceFallFlag',
      'IsCloseOut',
      'IsNewArrived',
      'IsHotSeller',
      'Purchasable',
      'Hidden',
      'AutoUpdatePrice',
      'ShowRetailPrice',
      'Jewelry For',
      'Jewelry Type',
      'Finishing',
      'Number of Pcs',
      'Diamond Type',
      'Diamond Total Weight',
      'Diamond Clarity',
      'Diamond Total Pcs',
      'Diamond Color',
      'Center Diamond Weight',
      'IsGIACertified',
      'Length',
      'Width',
      'Pendant Length',
      'Pendant Width',
      'Earrings Length',
      'Earrings Width',
      'Earring Post Type',
      'Ring Size',
      'Ring Design Height',
      'Ring Width',
      'Ring Type',
      'Bangle Size',
      'Bangle/Bracelet Size Adjustable up-to',
      'Bangle Inner Diameter',
      'Bangle Width',
      'Bangle Design Height',
      'Bangle/Bracelet Type',
      'Chain included in the price',
      'Nose Pin Type',
      'Watch Disclaimer',
      'Changeable Stones Included',
      'Gemstones Weight',
      'Disclaimer',
      'Gemstones Type',
      'MarginPrice',
      'Classification',
      'CustPrice',
      'PerGramOrDisc',
      'Collection',
      'StyleName',
      'Chain Length',
      'RelatedSKU',
      'Certificate#',
      'Certification',
      'DC',
      'SearchUploadDate',
      'MultiStyleCode',
    ],
    fileName: 'data.xlsx',
    sheetName: 'Sheet1',
  };

  function getExcelData(apiRef) {
    // Select rows and columns
    const filteredSortedRowIds =
      gridFilteredSortedRowIdsSelector(apiRef);
    const visibleColumnsField =
      gridVisibleColumnFieldsSelector(apiRef);

    // Format the data. Here we only keep the value
    const data = filteredSortedRowIds.map((id) => {
      const row = {};
      visibleColumnsField.forEach((field) => {
        row[field] = apiRef.current.getCellParams(id, field).value;
      });
      return row;
    });

    return data;
  }

  function handleExport(apiRef) {
    const data = getExcelData(apiRef); // Retrieve the data

    // Map rows based on visible column fields
    const rows = data.map((row) => {
      const mRow = {};
      config.columnNames.forEach((key) => {
        mRow[key] = row[key];
      });
      return mRow;
    });

    // Create worksheet with rows and headers
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.sheet_add_aoa(worksheet, [config.columnNames], {
      origin: 'A1',
    });

    // Create workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      config.sheetName
    );

    // Write the file
    XLSX.writeFile(workbook, config.fileName, { compression: true });
  }

  return (
    <MenuItem
      onClick={() => {
        handleExport(apiRef);
        // Hide the export menu after the export
        hideMenu?.();
      }}>
      Download Excel
    </MenuItem>
  );
}
