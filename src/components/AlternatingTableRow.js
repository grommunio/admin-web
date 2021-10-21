import { TableRow } from "@mui/material";
import { withStyles } from '@mui/styles';

const AlternatingTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(even)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export default AlternatingTableRow;