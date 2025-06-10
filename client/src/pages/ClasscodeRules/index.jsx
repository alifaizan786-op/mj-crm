import Common from "../../layouts/common";
import React from "react";
import PricingPolicyFetch from "../../fetch/PricingPolicyFetch";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Loader from "../../components/Loader";
import TextField from "@mui/material/TextField";

export default function ClasscodeRules() {
  const [pricingPolicy, setPricingPolicy] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filteredRows, setFilteredRows] = React.useState([]);


  function CustomToolbar() {
    return (
      <GridToolbarContainer
        sx={{ justifyContent: "space-between", padding: "0% 5%" }}
      >
        <GridToolbarColumnsButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            allColumns: true,
            fileName: "ClientData.csv",
            utf8WithBom: true,
          }}
        />
      </GridToolbarContainer>
    );
  }

  React.useEffect(() => {
    const fetchPricingPolicy = async () => {
      try {
        const data = await PricingPolicyFetch.getPricingPolicy();
        setPricingPolicy(data);
      } catch (error) {
        console.error("Error fetching pricing policy:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPricingPolicy();
  }, []);

  const columns = [
    {
      field: "ClassCode",
      headerName: "Class Code",
      width: 100,
      valueGetter: (params) => {
        return `${params.row.Classcode}`;
      },
    },
    {
      field: "ClasscodeDesc",
      headerName: "Class Code Description",
      width: 300,
    },
    {
      field: "Type",
      headerName: "Type",
      width: 100,
    },

    {
      field: "Vendor",
      headerName: "Vendor",
      width: 100,
    },
    {
      field: "FromMonths",
      headerName: "From Months",
      width: 100,
    },
    {
      field: "ToMonths",
      headerName: "To Months",
      width: 100,
    },
    {
      field: "BaseMargin",
      headerName: "Base Margin",
      width: 100,
    },
    {
      field: "DiscountOnMargin",
      headerName: "Discount On Margin",
      width: 150,
    },
    {
      field: "Base22KtRate",
      headerName: "Base 22Kt Rate",
      width: 100,
    },
    {
      field: "Base21KtRate",
      headerName: "Base 21Kt Rate",
      width: 100,
    },
    {
      field: "Base18KtRate",
      headerName: "Base 18Kt Rate",
      width: 100,
    },
  ];

  const rows = [...pricingPolicy];

  React.useEffect(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();

    if (trimmedQuery === "") {
      setFilteredRows(pricingPolicy);
      return;
    }

    const filtered = pricingPolicy.filter(
      (row) => row.Classcode?.toString().toLowerCase() === trimmedQuery
    );

    setFilteredRows(filtered);
  }, [searchQuery, pricingPolicy]);

  return (
    <Common>
      {/* Search Field */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <TextField
          label="Search"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>
      <Box sx={{ height: 800, width: "100%" }}>
        {/* DataGrid */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: CustomToolbar,
            LoadingOverlay: () => <Loader size={"75"} />,
          }}
          autoPageSize
          getRowId={(row) => row._id}
          disableRowSelectionOnClick
        />
      </Box>
    </Common>
  );
}
