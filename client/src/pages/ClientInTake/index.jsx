import React from 'react';
import HomeHeader from '../../components/HomeHeader';
import '../../custom.css';
import ClientInTakeFetch from '../../fetch/ClientInTakeFetch';

import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

export default function ClientInTake() {
  const [clientData, setClientData] = React.useState([]);
  const [archive, setArchive] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  document.title = 'MJ | Client In Take ';

  React.useEffect(() => {
    getClientData();

    // Set up the interval
    const intervalId = setInterval(getClientData, 30000); // Pass the function reference

    // Clear the interval on component unmount to avoid memory leaks
    return () => clearInterval(intervalId);
  }, [archive]);

  async function getClientData() {
    try {
      const region = localStorage.getItem('region');
      let allClientData = [];
      if (archive) {
        allClientData = await ClientInTakeFetch.getMonthEntries(
          region.toLowerCase()
        );
        // Ensure response is an array
        setClientData(allClientData.clients);
      } else {
        allClientData = await ClientInTakeFetch.getTodayEntries(
          region.toLowerCase()
        );
        // Ensure response is an array
        setClientData(allClientData);
      }
    } catch (error) {
      console.error('Error fetching client data:', error);
      setClientData([]); // Default to empty array on error
    }
  }

  console.log(clientData);

  const columns = [
    {
      id: 'dateCreated',
      label: archive ? 'Date Entered' : 'Time Entered',
      minWidth: 125,
      align: 'left',
      format: (param) => {
        const dateObj = new Date(param.replace(/\.\d+Z$/, 'Z'));
        return archive
          ? dateObj.toLocaleDateString('en-US')
          : dateObj.toLocaleTimeString('en-US');
      },
    },
    {
      id: 'lastName',
      label: 'Last Name',
      minWidth: 125,
      align: 'left',
    },
    {
      id: 'firstName',
      label: 'First Name',
      minWidth: 125,
      align: 'left',
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 150,
      align: 'left',
    },
    {
      id: 'mobilePhoneNumber',
      label: 'Mobile',
      minWidth: 125,
      align: 'left',
    },
    {
      id: 'homePhoneNumber',
      label: 'Home',
      minWidth: 125,
      align: 'left',
    },
    {
      id: 'addressLine',
      label: 'Address',
      minWidth: 175,
      align: 'left',
    },
    {
      id: 'city',
      label: 'City',
      minWidth: 100,
      align: 'left',
    },
    {
      id: 'state',
      label: 'State',
      minWidth: 50,
      align: 'left',
    },
    {
      id: 'zipCode',
      label: 'Zip Code',
      minWidth: 75,
      align: 'left',
    },
    {
      id: 'hisBirthday',
      label: 'His Birthday',
      minWidth: 100,
      align: 'left',
    },
    {
      id: 'herBirthday',
      label: 'Her Birthday',
      minWidth: 100,
      align: 'left',
    },
    {
      id: 'anniversary',
      label: 'Anniversary',
      minWidth: 100,
      align: 'left',
    },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };
  const handleArchiveChange = (event) => {
    setArchive(event.target.checked);
  };

  const rows = clientData?.length > 0 ? [...clientData] : [];

  console.log(rows);

  return (
    <>
      <HomeHeader
        showSetting={false}
        showHome={true}
        showClientInTake={false}
        showArchiveSwitch={true}
        setArchive={setArchive}
        archive={archive}
        handleArchiveChange={handleArchiveChange}
      />
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer
          elevation={0}
          sx={{ maxHeight: { xs: 450, sm: 825 } }}>
          <Table
            stickyHeader
            size='small'
            aria-label='sticky table'>
            <TableHead elevation={0}>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}>
                    <strong>{column.label}</strong>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                return (
                  <TableRow
                    hover
                    role='checkbox'
                    tabIndex={-1}
                    key={row._id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          onClick={() => {
                            // Copy the text inside the text field
                            navigator.clipboard.writeText(value);
                          }}>
                          {column.format
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
