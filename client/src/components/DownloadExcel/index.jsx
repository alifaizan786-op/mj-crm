import { Button } from '@mui/material';
import { CSVLink } from 'react-csv';

export default function DownloadExcel({ disabled, data, name }) {
  return (
    <CSVLink
      data={data}
      filename={'InvReport' + '.csv'}>
      <Button
        sx={{ width: 300, marginX: '1rem' }}
        size='medium'
        variant='outlined'
        disabled={disabled}>
        {name || 'Export'}
      </Button>
    </CSVLink>
  );
}
