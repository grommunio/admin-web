import { TableRow, withStyles } from "@material-ui/core";

const AlternatingTableRow = withStyles((theme) => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}))(TableRow);

export default AlternatingTableRow;