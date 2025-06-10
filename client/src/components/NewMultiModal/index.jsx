import {
  Box,
  Divider,
  FormControl,
  Modal,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import React from "react";
import Filters from "../../components/Filters";
import AttributeFetch from "../../fetch/AttributeFetch";
import MultiFetch from "../../fetch/MultiFetch";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 5,
};

export default function NewMultiModal({ open, onClose }) {
  const [formState, setFormState] = React.useState({
    vendorCode: "",
    majorCode: "",
    colorCode: "",
    finishCode: "",
    image: "",
  });
  const { enqueueSnackbar } = useSnackbar();

  const [nextMulti, setNextMulti] = React.useState("00000");
  const [attributes, setAttributes] = React.useState([]);

  React.useEffect(() => {
    async function getData() {
      try {
        const allAttributeData = await AttributeFetch.getAllAttributes();
        setAttributes(allAttributeData);

        const nextMultData = await MultiFetch.nextMulti();
        setNextMulti(nextMultData.nextMulti);
      } catch (error) {
        console.log(error);
      }
    }

    getData();
  }, [open, onClose]);

  const handleChange = async (event) => {
    const { name, value } = event.target;

    setFormState({
      ...formState,
      multiCode: multiCodeGen(),
      [name]: value,
    });

    multiCodeGen();
  };

  function multiCodeGen() {
    const uuid = `${nextMulti}`.padStart(5, "0");
    let colorCode = "";
    let finishCode = "";

    switch (formState.colorCode) {
      case "Yellow":
        colorCode = "Y";
        break;
      case "White":
        colorCode = "W";
        break;
      case "Rose":
        colorCode = "R";
        break;
      case "Yellow and White":
        colorCode = "YW";
        break;
      case "Yellow and Rose":
        colorCode = "YR";
        break;
      case "White and Rose":
        colorCode = "WR";
        break;
      case "Yellow and White and Rose":
        colorCode = "YWR";
        break;
      case "Two-tone":
        colorCode = "TT";
        break;
      case "Three-tone":
        colorCode = "3T";
        break;
      case "Antique":
        colorCode = "ATQ";
        break;
      default:
        colorCode = "NA";
    }

    switch (formState.finishCode) {
      case "Yellow":
        finishCode = "Y";
        break;
      case "White":
        finishCode = "W";
        break;
      case "Rose":
        finishCode = "R";
        break;
      case "Yellow and White":
        finishCode = "YW";
        break;
      case "Yellow and Rose":
        finishCode = "YR";
        break;
      case "White and Rose":
        finishCode = "WR";
        break;
      case "Yellow and White and Rose":
        finishCode = "YWR";
        break;
      case "Antique":
        finishCode = "ATQ";
        break;
      case "Minakari":
        finishCode = "MNC";
        break;
      case "Three tone":
        finishCode = "3T";
        break;
      case "Two tone":
        finishCode = "TT";
        break;
      default:
        finishCode = "NA";
    }
    return `${formState.majorCode}-${uuid}-${formState.vendorCode}-${colorCode}-${finishCode}`;
    // setMultiCode(multiCodeGen);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setTimeout(async () => {
        console.log({
          multiCode: multiCodeGen(),
          vendorCode: formState.vendorCode,
          majorCode: formState.majorCode,
          finishCode: formState.finishCode,
          colorCode: formState.colorCode,
          image: formState.image,
        });
        const newMultiCodeData = await MultiFetch.createMulti({
          multiCode: multiCodeGen(),
          vendorCode: formState.vendorCode,
          majorCode: formState.majorCode,
          finishCode: formState.finishCode,
          colorCode: formState.colorCode,
          image: formState.image,
        });

        enqueueSnackbar("Multi Code Created Successfully  ", {
          variant: "success",
        });
        window.location.reload();
        onClose();
      }, 1000);
    } catch (error) {
      enqueueSnackbar(error, {
        variant: "error",
      });
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
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
            New Multi Code
          </Typography>
        </Box>
        <Box>
          {formState.image && (
            <img
              src={`https://www.malanijewelers.com/TransactionImages/Styles/small/${formState.image}`}
              width="300"
            />
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              flexWrap: "wrap",
              width: "100%",
              height: "100%",
              marginY: "10px",
              minHeight: "2rem",
              flexDirection: "column",
            }}
          >
            <FormControl>
              <TextField
                required
                disabled
                sx={{ width: 300, marginX: "1rem", marginY: "1rem" }}
                size="small"
                name="multiCode"
                value={formState.multiCode}
              />
            </FormControl>
            <Divider />
            <FormControl>
              <TextField
                required
                label="Image"
                sx={{ width: 300, marginX: "1rem", marginY: "1rem" }}
                size="small"
                name="image"
                value={formState.image}
                onChange={handleChange}
              />
            </FormControl>
            <Divider />
            {attributes.length > 0 && (
              <Filters
                state={formState}
                setState={setFormState}
                handleSubmit={handleSubmit}
                orientation={"column"}
                filters={[
                  {
                    name: "majorCode",
                    options: attributes.filter(
                      (item) => item.title === "Classcodes"
                    )[0]?.options,
                    label: "majorCode",
                    stateId: "majorCode",
                    type: "autocomplete",
                  },
                  {
                    name: "vendorCode",
                    options: attributes.filter(
                      (item) => item.title === "Vendors"
                    )[0]?.options,
                    label: "vendorCode",
                    stateId: "vendorCode",
                    type: "autocomplete",
                  },
                  {
                    name: "colorCode",
                    options: attributes.filter(
                      (item) => item.title === "JewelryColor"
                    )[0]?.options,
                    label: "colorCode",
                    stateId: "colorCode",
                    type: "autocomplete",
                  },
                  {
                    name: "finishCode",
                    options: attributes.filter(
                      (item) => item.title === "Finishing"
                    )[0]?.options,
                    label: "finishCode",
                    stateId: "finishCode",
                    type: "autocomplete",
                  },
                ]}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}
