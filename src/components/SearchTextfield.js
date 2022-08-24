import React from 'react';
import { InputAdornment, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import { Search } from '@mui/icons-material';

const SearchTextfield = ({ ...childProps }) =>
  <TextField
    {...childProps}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <Search color="secondary" />
        </InputAdornment>
      ),
    }}
    color="primary"
  />;

export default withStyles()(SearchTextfield);