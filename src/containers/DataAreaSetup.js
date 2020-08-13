import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';
import { Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, FormControl, MenuItem, Dialog, DialogContent, DialogTitle,
  Button, DialogActions } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Close';
import TopBar from '../components/TopBar';
import { dataArea, addDataArea, deleteDataArea } from '../api';

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

  componentDidMount() {
    dataArea().then(json => {
      if(json) this.setState({ table: json });
    });
  }

  state = {
    table: {
      user: [],
      domain: [],
      independent: [],
    },
    newData: {
      dataType: 0, 
      masterPath: '', 
      slavePath: '', 
      accelPath: '', 
      maxSpace: 0, 
      maxFiles: 0,
      storeLevels: 2,
    },
    addOpen: false,
  }

  handleInput = field => event => {
    this.setState({
      newData: {
        ...this.state.newData,
        [field]: event.target.value,
      },
    });
  }

  types = [
    { name: 'user data', ID: 0 },
    { name: 'domain data', ID: 1 },
    { name: 'independant storage', ID: 2 },
  ];

  handleAdd = () => {
    addDataArea({
      ...this.state.newData,
      accelPath: this.state.accelPath || null,
    }).then(() => this.setState({ addOpen: false }))
      .then(() => dataArea().then(json => {
        if(json) this.setState({ table: json });
      }));
  }

  handleDelete = id => () => {
    deleteDataArea(id).then(() => dataArea().then(json => {
      if(json) this.setState({ table: json });
    }));
  }

  handleNumberInput = field => event => {
    let input = event.target.value;
    if(input === '' || input.match("^\\d*?$")) {
      if(input !== '') input = parseInt(input);
      this.setState({
        newData: {
          ...this.state.newData,
          [field]: input,
        },
      });
    }
  }

  render() {
    const { classes, t } = this.props;
    const { table, newData } = this.state;

    return (
      <div className={classes.root}>
        <TopBar onAdd={() => this.setState({ addOpen: true })} title="Data Area Setup"/>
        <div className={classes.toolbar}></div>
        <div className={classes.base}>
          <Dialog onClose={() => this.setState({ addOpen: false })} open={this.state.addOpen} maxWidth="lg">
            <DialogTitle>Add</DialogTitle>
            <DialogContent style={{ minWidth: 400 }}>
              <FormControl className={classes.form}>
                <TextField
                  select
                  className={classes.input}
                  label={t("data type")}
                  fullWidth
                  value={newData.dataType}
                  onChange={this.handleInput('dataType')}
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
                  value={newData.masterPath}
                  onChange={this.handleInput('masterPath')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("database accelerating storage area")} 
                  fullWidth
                  value={newData.accelPath}
                  onChange={this.handleInput('accelPath')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("slave data area")} 
                  fullWidth
                  value={newData.slavePath}
                  onChange={this.handleInput('slavePath')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("maximum space")} 
                  fullWidth
                  value={newData.maxSpace}
                  onChange={this.handleNumberInput('maxSpace')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("maximum files")}
                  fullWidth
                  value={newData.maxFiles}
                  onChange={this.handleNumberInput('maxFiles')}
                />
                <TextField 
                  className={classes.input} 
                  label={t("Store levels")}
                  fullWidth
                  value={newData.storeLevels}
                  onChange={this.handleNumberInput('storeLevels')}
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
          <Paper className={classes.tablePaper} elevation={2}>
            <Table size="small">
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
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.user.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.maxFiles}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedFiles}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                    <TableCell>
                      <IconButton onClick={this.handleDelete(obj.ID)}>
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
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
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.domain.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.maxFiles}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedFiles}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                    <TableCell>
                      <IconButton  onClick={this.handleDelete(obj.ID)} >
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
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
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {table.independent.map((obj, idx) =>
                  <TableRow key={idx}>
                    <TableCell>{obj.masterPath}</TableCell>
                    <TableCell>{obj.accelPath}</TableCell>
                    <TableCell>{obj.slavePath}</TableCell>
                    <TableCell>{obj.maxSpace}</TableCell>
                    <TableCell>{obj.maxFiles}</TableCell>
                    <TableCell>{obj.usedSpace}</TableCell>
                    <TableCell>{obj.usedFiles}</TableCell>
                    <TableCell>{obj.usedNumber}</TableCell>
                    <TableCell>
                      <IconButton  onClick={this.handleDelete(obj.ID)} >
                        <Delete color="error"/>
                      </IconButton>
                    </TableCell>
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