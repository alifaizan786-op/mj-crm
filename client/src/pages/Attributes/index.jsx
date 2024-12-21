import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Box,
  Button,
  Fab,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import React from 'react';
import NewAttributeModal from '../../components/NewAttributeModal';
import NewAttributeValueModal from '../../components/NewAttributeValueModal';
import ViewAttributeValue from '../../components/ViewAttributeValue';
import AttributeFetch from '../../fetch/AttributeFetch';
import Common from '../../layouts/common';

export default function Attributes() {
  const { enqueueSnackbar } = useSnackbar();

  const [attributesData, setAttributesData] = React.useState({
    loading: true,
    data: [],
  });

  const [newAttributeOpen, setNewAttributeOpen] =
    React.useState(false);

  const [attributeValueOpen, setAttributeValueOpen] = React.useState(
    {}
  );

  const [newAttributeValueOpen, setNewAttributeValueOpen] =
    React.useState({});

  async function getData() {
    const data = await AttributeFetch.getAllAttributes();
    setAttributesData({
      loading: false,
      data: data,
    });
    let tempObj;
    for (let i = 0; i < data.length; i++) {
      const element = data[i];
      tempObj = {
        ...tempObj,
        [element.title]: false,
      };
    }
    setAttributeValueOpen(tempObj);
    setNewAttributeValueOpen(tempObj);
  }

  React.useEffect(() => {
    getData();
  }, []);

  const handleDelete = async (id) => {
    try {
      const deleteAttrib = AttributeFetch.deleteAttributeById(id);
      enqueueSnackbar('Attribute Deleted Successfully  ', {
        variant: 'success',
      });
      getData();
    } catch (error) {
      enqueueSnackbar(error, {
        variant: 'error',
      });
    }
  };

  return (
    <Common>
      <Box
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 20, // Ensure it appears above the overlay
        }}>
        <Fab
          color='primary'
          onClick={() => {
            setNewAttributeOpen(true);
          }}>
          <AddIcon />
        </Fab>
      </Box>
      <NewAttributeModal
        open={newAttributeOpen}
        setOpen={setNewAttributeOpen}
        handleOpen={() => {
          setNewAttributeOpen(true);
        }}
        handleClose={() => {
          setNewAttributeOpen(false);
          getData();
        }}
      />
      <TableContainer elevation={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align='left'>Attribute Title</TableCell>
              <TableCell align='center'>Options</TableCell>
              <TableCell align='center'>
                New Attribute Value
              </TableCell>
              <TableCell align='center'>
                Delete Attribute Set
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attributesData.loading == false &&
              attributesData.data.map((item) => (
                <TableRow index={item._id}>
                  <TableCell align='left'>{item.title}</TableCell>
                  <TableCell align='center'>
                    <Button
                      onClick={() => {
                        setAttributeValueOpen({
                          ...attributeValueOpen,
                          [item.title]: true,
                        });
                      }}>
                      {item.options.length}
                    </Button>
                  </TableCell>
                  <TableCell align='center'>
                    <IconButton
                      onClick={() => {
                        setNewAttributeValueOpen({
                          ...newAttributeValueOpen,
                          [item.title]: true,
                        });
                      }}>
                      <AddIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align='center'>
                    <IconButton
                      onClick={() => {
                        handleDelete(item._id);
                      }}>
                      <DeleteOutlineIcon color='error' />
                    </IconButton>
                  </TableCell>
                  <NewAttributeValueModal
                    open={newAttributeValueOpen[item.title]}
                    handleClose={() => {
                      setNewAttributeValueOpen({
                        ...newAttributeValueOpen,
                        [item.title]: false,
                      });
                      getData();
                    }}
                    _id={item._id}
                    title={item.title}
                    options={item.options}
                  />
                  <ViewAttributeValue
                    open={attributeValueOpen[item.title]}
                    handleClose={() => {
                      setAttributeValueOpen({
                        ...attributeValueOpen,
                        [item.title]: false,
                      });
                      getData();
                    }}
                    title={item.title}
                    options={item.options}
                    _id={item._id}
                  />
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Common>
  );
}
