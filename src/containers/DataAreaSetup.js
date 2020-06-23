import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Grid,
  TextField, FormControl, MenuItem, Typography, Dialog, DialogContent, DialogTitle,
  Button, DialogActions } from '@material-ui/core';

const styles = theme => ({
  root: {
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
  },
  base: {
    flexDirection: 'column',
    padding: theme.spacing(2),
    flex: 1,
    display: 'flex',
    overflowY: 'auto',
  },
  paper: {
    margin: theme.spacing(3, 2),
    padding: theme.spacing(2),
    borderRadius: 6,
  },
  tablePaper: {
    margin: theme.spacing(3, 2),
    borderRadius: 6,
  },
  paperHeading: {
    margin: theme.spacing(-1, 0, 0, 2),
  },
  grid: {
    padding: theme.spacing(0, 2),
  },
  form: {
    width: '100%',
    marginTop: theme.spacing(4),
  },
  input: {
    marginBottom: theme.spacing(3),
  },
  toolbar: theme.mixins.toolbar,
  flexRowEnd: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
});

class DataAreaSetup extends Component {

  state = {
    changes: {},
    addOpen: false,
  }

  data1 = [
    {
      example: 'hehexd',
    },
    {
      example: '69',
    },
    {
      example: '1337',
    },
  ]

  handleInput = field => event => {
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: event.target.value,
      },
    });
  }

  handleNumberInput = field => event => {
    const input = event.target.value;
    this.setState({
      changes: {
        ...this.state.changes,
        [field]: input.match(),
      },
    });
  }

  types = [
    { name: 'user data', ID: 0 },
    { name: 'domain data', ID: 1 },
    { name: 'indepoendant sorage', ID: 2 },
  ];

  render() {
    const { classes, t } = this.props;
    const { changes } = this.state;

    return (
      <div className={classes.root}>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Grid className={classes.grid} container>
            <Grid item xs={3}></Grid>
            <Grid item xs={6}>
              <Typography align="center" variant="h4" color="primary">data store area management</Typography>
            </Grid>
            <Grid item xs={3} className={classes.flexRowEnd}>
              <Button variant="contained" color="primary" onClick={() => this.setState({ addOpen: true })}>Add</Button>
            </Grid>
          </Grid>
          <Dialog open={this.state.addOpen} maxWidth="lg">
            <DialogTitle>Add</DialogTitle>
            <DialogContent style={{ minWidth: 400 }}>
              <FormControl className={classes.form}>
                <TextField
                  select
                  className={classes.input}
                  label={t("data type")}
                  fullWidth
                  value={changes.parent || 0}
                  onChange={this.handleInput('parent')}
                >
                  {this.types.map((type, key) => (
                    <MenuItem key={key} value={type.ID}>
                      {type.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField 
                  className={classes.input} 
                  label={t("master data area")}
                  fullWidth
                  value={changes.masterDataArea || ''}
                  onChange={this.handleInput('masterDataArea')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("database accelerating storage area")} 
                  fullWidth
                  value={changes.databaseAcceleratingStorageArea || ''}
                  onChange={this.handleInput('databaseAcceleratingStorageArea')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("slave data area")} 
                  fullWidth
                  value={changes.slaveDataArea || ''}
                  onChange={this.handleInput('slaveDataArea')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("maximum space")} 
                  fullWidth
                  value={changes.maximumSpace || ''}
                  onChange={this.handleInput('maximumSpace')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("maximum files")}
                  fullWidth
                  value={changes.maximumFiles || ''}
                  onChange={this.handleInput('maximumFiles')}
                />
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.setState({ addOpen: false })}
                variant="contained"
                color="secondary"
              >
                Cancel
              </Button>
              <Button
                onClick={this.handleAdd}
                variant="contained"
                color="primary"
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <Paper className={classes.tablePaper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>master user data area</TableCell>
                  <TableCell>master accelerated storage area</TableCell>
                  <TableCell>slave user data area</TableCell>
                  <TableCell>maximum space</TableCell>
                  <TableCell>maximum files</TableCell>
                  <TableCell>used space</TableCell>
                  <TableCell>used files</TableCell>
                  <TableCell>user number</TableCell>
                  <TableCell>operation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.data1.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableHead>
                <TableRow>
                  <TableCell>master domain data area</TableCell>
                  <TableCell>master accelerated storage area</TableCell>
                  <TableCell>slave domain data area</TableCell>
                  <TableCell>maximum space</TableCell>
                  <TableCell>maximum files</TableCell>
                  <TableCell>used space</TableCell>
                  <TableCell>used files</TableCell>
                  <TableCell>domain number</TableCell>
                  <TableCell>operation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.data1.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableHead>
                <TableRow>
                  <TableCell>master independent storage area</TableCell>
                  <TableCell>master accelerated storage area</TableCell>
                  <TableCell>slave independent storage data area</TableCell>
                  <TableCell>maximum space</TableCell>
                  <TableCell>maximum files</TableCell>
                  <TableCell>used space</TableCell>
                  <TableCell>used files</TableCell>
                  <TableCell>independent storage number</TableCell>
                  <TableCell>operation</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {this.data1.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                    <TableCell>{obj.example}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </div>
      </div>
    );
  }
}

DataAreaSetup.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(withStyles(styles)(DataAreaSetup));