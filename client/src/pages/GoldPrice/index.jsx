import Common from "../../layouts/common";
import React from "react";
import GoldPriceFetch from "../../fetch/GoldPriceFetch";
import {
  DataGrid,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
} from "@mui/x-data-grid";
import Box from "@mui/material/Box";
import Loader from "../../components/Loader";
import { TextField, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import auth from "../../utils/auth";
import Modal from "@mui/material/Modal";
import { useSnackbar } from "notistack";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function GoldPrice() {
  const [goldPrice, setGoldPrice] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const { enqueueSnackbar } = useSnackbar();

  const handleClose = () => setOpen(false);
  const [formstate, setFormState] = React.useState({
    PerOunceRate: "",
  });

  const fetchGoldPrice = async () => {
    try {
      const data = await GoldPriceFetch.getGoldPrice();
      setGoldPrice(data);
    } catch (error) {
      console.error("Error fetching gold price:", error);
    } finally {
      setLoading(false);
    }
  };
  React.useEffect(() => {
    fetchGoldPrice();
  }, []);

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
            fileName: "GoldPriceData.csv",
            utf8WithBom: true,
          }}
        />
        <Button
          variant="standard"
          size="small"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add Gold Price
        </Button>
      </GridToolbarContainer>
    );
  }

  const columns = [
    {
      field: "date",
      headerName: "Date",
      width: 150,
      valueGetter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "PerOunceRate",
      headerName: "Per Ounce Rate",
      width: 150,
      valueGetter: (params) => `$${params.value}`,
    },
    {
      field: "Base22KtRate",
      headerName: "Base 22Kt Rate",
      width: 150,
      valueGetter: (params) => `$${params.value}`,
    },
    {
      field: "Base21KtRate",
      headerName: "Base 21Kt Rate",
      width: 150,
      valueGetter: (params) => `$${params.value}`,
    },
    {
      field: "Base18KtRate",
      headerName: "Base 18Kt Rate",
      width: 150,
      valueGetter: (params) => `$${params.value}`,
    },
    {
      field: "UpdatedBy",
      headerName: "Updated By",
      width: 200,
      valueGetter: (params) => params.row.UpdatedBy?.employeeId || "Unknown",
    },
  ];

  const rows = [...goldPrice];

  const handleSubmit = async () => {
    try {
      const data = {
        UpdatedBy: auth.getProfile().data._id,
        PerOunceRate: formstate.PerOunceRate,
      };

      const response = await GoldPriceFetch.createGoldPrice(data);

      console.log("Gold price submitted successfully:", response);

      fetchGoldPrice();

      enqueueSnackbar("Gold Price & Classcode Rules Updated Successfully", {
        variant: "success",
      });
      handleClose();
    } catch (error) {
      console.log("Error submitting gold price:", error);
      enqueueSnackbar(error, {
        variant: "error",
      });
    }
  };

  return (
    <Common>
      <Box sx={{ height: 800, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          components={{
            Toolbar: CustomToolbar,
            LoadingOverlay: () => <Loader size={"75"} />,
          }}
          autoPageSize
          getRowId={(row) => row.date}
        />
      </Box>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Box
            sx={{
              width: "100%",
              bgcolor: "primary.light",
              borderRadius: 5,
            }}
          >
            <Typography
              variant="h5"
              component="h2"
              textAlign="center"
              sx={{ p: 0.5, color: "primary.main" }}
            >
              Update Gold Price
            </Typography>
          </Box>
          <TextField
            label="Per Ounce Rate"
            variant="outlined"
            fullWidth
            margin="normal"
            type="number"
            size="small"
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                PerOunceRate: e.target.value,
              }))
            }
          />
          <Button
            variant="standard"
            color="primary"
            fullWidth
            onClick={handleSubmit}
            sx={{ mt: 2 }}
          >
            Submit
          </Button>
        </Box>
      </Modal>
    </Common>
  );
}
