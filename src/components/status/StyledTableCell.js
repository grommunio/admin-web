import { TableCell, withStyles } from '@material-ui/core';

const StyledTableCell = withStyles(() => ({
  head: {
    backgroundColor: '#C9E7FF',
    border: '1px solid white',
  },
}))(TableCell);

export default StyledTableCell;