import { TableCell } from '@mui/material';
import { withStyles } from '@mui/styles';

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: '#C9E7FF',
    border: '1px solid white',
    color: 'black',
  },
}))(TableCell);

export default StyledTableCell;